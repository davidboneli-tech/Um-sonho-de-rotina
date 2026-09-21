import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { generateKeyPairSync, randomBytes } from "node:crypto";
import worker, { handle, deliver, validSubscription } from "../worker.mjs";

const now = Date.parse("2026-09-21T12:00:00Z");
const id = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const notice = { id: "event:1", at: now + 60000, body: "Você tem um compromisso às 09:01. Abra sua agenda para conferir." };
function keys() {
  const { privateKey } = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
  const k = privateKey.export({ format: "jwk" });
  return { privateKey: k.d, publicKey: Buffer.concat([Buffer.from([4]), Buffer.from(k.x, "base64url"), Buffer.from(k.y, "base64url")]).toString("base64url") };
}
function setup() {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys=ON");
  db.exec(readFileSync(new URL("../migrations/0001_notifications.sql", import.meta.url), "utf8"));
  const prepare = (sql, params = []) => ({
    bind: (...p) => prepare(sql, p),
    first: async () => db.prepare(sql).get(...params) || null,
    all: async () => ({ results: db.prepare(sql).all(...params) }),
    run: async () => ({ meta: db.prepare(sql).run(...params) }),
  });
  const vapid = keys(), client = keys();
  const env = {
    DB: { prepare, batch: async statements => {
      db.exec("BEGIN");
      try { const results = []; for (const s of statements) results.push(await s.run()); db.exec("COMMIT"); return results; }
      catch (e) { db.exec("ROLLBACK"); throw e; }
    } },
    APP_ORIGIN: "https://planner.example", PUSH_TOKEN: "A".repeat(43), VAPID_PUBLIC_KEY: vapid.publicKey, VAPID_PRIVATE_KEY: vapid.privateKey,
  };
  const sub = { endpoint: "https://web.push.apple.com/real-subscription-placeholder", keys: { p256dh: client.publicKey, auth: randomBytes(16).toString("base64url") } };
  const request = (path, body, token = env.PUSH_TOKEN) => new Request(`https://worker.example${path}`, { method: body === undefined ? "GET" : "POST", headers: { Origin: env.APP_ORIGIN, Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
  const api = (path, body) => handle(request(path, body), env, now);
  const subscribe = () => api("/subscribe", { device: id, subscription: sub });
  const sync = items => api("/sync", { device: id, items });
  return { db, env, request, api, subscribe, sync, sub };
}
test("authorization, CORS, endpoint validation and payload privacy", async () => {
  const x = setup();
  assert.equal((await handle(x.request("/config", undefined, "wrong"), x.env, now)).status, 401);
  assert.equal((await worker.fetch(new Request("https://worker.example/config"), x.env)).status, 403);
  assert.equal((await x.subscribe()).status, 200);
  for (const endpoint of ["http://web.push.apple.com/x", "https://127.0.0.1/x", "https://web.push.apple.com.attacker.com/x", "https://user@web.push.apple.com/x"]) assert.equal(validSubscription({ ...x.sub, endpoint }), false);
  assert.equal((await x.sync([{ ...notice, body: "Private medicine dosage" }])).status, 400);
  assert.equal((await x.sync([notice, notice])).status, 400);
  const config = await (await x.api("/config")).json();
  assert.deepEqual(Object.keys(config), ["publicKey"]);
});
test("schedule changes, deletions and disabling are atomic and remove old reminders", async () => {
  const x = setup(); await x.subscribe();
  assert.equal((await x.sync([notice])).status, 200);
  await x.sync([{ ...notice, at: now + 120000 }]);
  assert.equal(x.db.prepare("SELECT at FROM reminders").get().at, now + 120000);
  await x.sync([]); assert.equal(x.db.prepare("SELECT COUNT(*) AS n FROM reminders").get().n, 0);
  await x.sync([notice]); await x.api("/disable", { device: id });
  assert.equal(x.db.prepare("SELECT COUNT(*) AS n FROM reminders").get().n, 0);
});
test("real Web Push encryption, successful delivery and duplicate suppression", async () => {
  const x = setup(); await x.subscribe(); await x.sync([notice]); let calls = 0;
  const transport = async (endpoint, options) => {
    calls++; assert.equal(endpoint, x.sub.endpoint);
    const headers = new Headers(options.headers);
    assert.equal(headers.get("content-encoding"), "aes128gcm");
    assert.match(headers.get("authorization"), /^vapid /);
    assert.ok(options.body.byteLength > 200);
    return new Response(null, { status: 201 });
  };
  await deliver(x.env, now, transport); assert.equal(calls, 0);
  await deliver(x.env, now + 61000, transport); assert.equal(calls, 1);
  await x.sync([notice]); // Same payload must not reset an already delivered notice.
  await deliver(x.env, now + 62000, transport); assert.equal(calls, 1);
  assert.equal(x.db.prepare("SELECT state FROM reminders").get().state, "sent");
});
test("retry after provider failure, expired subscriptions and stale event cutoff", async () => {
  const x = setup(); await x.subscribe(); await x.sync([notice]);
  await deliver(x.env, now + 61000, async () => new Response(null, { status: 503 }));
  assert.equal(x.db.prepare("SELECT attempts FROM reminders").get().attempts, 1);
  await deliver(x.env, now + 122000, async () => new Response(null, { status: 410 }));
  assert.equal(x.db.prepare("SELECT COUNT(*) AS n FROM devices").get().n, 0);
  await x.subscribe(); await x.sync([notice]); let calls = 0;
  await deliver(x.env, now + 12 * 60000, async () => { calls++; return new Response(null, { status: 201 }); });
  assert.equal(calls, 0);
});
test("preserve the test reminder during sync and reject missing devices", async () => {
  const x = setup(); await x.subscribe(); await x.sync([notice]);
  assert.equal((await x.api("/test", { device: id })).status, 200);
  assert.equal((await x.api("/test", { device: id })).status, 429);
  await x.sync([]);
  assert.equal(x.db.prepare("SELECT is_test FROM reminders").get().is_test, 1);
  const orphan = await x.api("/sync", { device: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", items: [] });
  assert.equal(orphan.status, 410);
});
