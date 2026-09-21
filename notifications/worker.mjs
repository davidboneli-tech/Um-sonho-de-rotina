import { buildPushPayload } from "@block65/webcrypto-web-push";

const DAY = 86400000;
const MAX_ITEMS = 4000;
const json = (value, status = 200) => Response.json(value, { status });
export function validDevice(id) {
  return typeof id === "string" && /^[a-f0-9-]{36}$/.test(id);
}
export function validSubscription(sub) {
  try {
    const u = new URL(sub.endpoint);
    const host = u.hostname;
    return u.protocol === "https:" && !u.port && !u.username && !u.password && !u.hash &&
      (host === "web.push.apple.com" || host.endsWith(".push.apple.com") || host === "fcm.googleapis.com" || host === "updates.push.services.mozilla.com") &&
      u.href.length < 4096 && /^[A-Za-z0-9_-]{87}$/.test(sub.keys.p256dh) && /^[A-Za-z0-9_-]{22}$/.test(sub.keys.auth);
  } catch { return false; }
}
export function validateItems(items, now) {
  if (!Array.isArray(items) || items.length > MAX_ITEMS) throw Error("items");
  const ids = new Set();
  return items.map(item => {
    if (!item || typeof item.id !== "string" || item.id.length > 240 || !item.id.length || item.id.startsWith("test:") || ids.has(item.id) ||
      !Number.isSafeInteger(item.at) || item.at < now - DAY || item.at > now + 367 * DAY ||
      typeof item.body !== "string" || !/^(Você tem um compromisso às \d{2}:\d{2}\. Abra sua agenda para conferir\.|Há um lembrete de medicamento\. Confira o registro no aplicativo\.)$/.test(item.body)) throw Error("item");
    ids.add(item.id);
    return { id: item.id, at: item.at, body: item.body };
  });
}
async function authorized(request, env) {
  if (!env.PUSH_TOKEN || env.PUSH_TOKEN.length < 32) return false;
  const raw = request.headers.get("Authorization") || "";
  if (raw.length > 200) return false;
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([raw, `Bearer ${env.PUSH_TOKEN}`].map(t => crypto.subtle.digest("SHA-256", enc.encode(t))));
  let diff = 0;
  const x = new Uint8Array(a), y = new Uint8Array(b);
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}
async function limitedJson(request) {
  const reader = request.body?.getReader();
  if (!reader) throw Error("body");
  let size = 0; const chunks = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 1200000) { await reader.cancel(); throw Error("size"); }
    chunks.push(value);
  }
  const out = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { out.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder().decode(out));
}
export async function handle(request, env, now = Date.now()) {
  const path = new URL(request.url).pathname;
  if (!await authorized(request, env)) return json({ error: "unauthorized" }, 401);
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) return json({ error: "not_configured" }, 503);
  if (path === "/config" && request.method === "GET") return json({ publicKey: env.VAPID_PUBLIC_KEY });
  if (path === "/status" && request.method === "GET") {
    const device = new URL(request.url).searchParams.get("device");
    if (!validDevice(device)) return json({ error: "device" }, 400);
    if (!await env.DB.prepare("SELECT id FROM devices WHERE id=?").bind(device).first()) return json({ error: "subscription_expired" }, 410);
    const failed = await env.DB.prepare("SELECT COUNT(*) AS n FROM reminders WHERE device=? AND state='failed'").bind(device).first();
    return json({ ok: true, failed: failed.n });
  }
  if (request.method !== "POST" || !request.headers.get("Content-Type")?.startsWith("application/json")) return json({ error: "method" }, 405);
  let body;
  try { body = await limitedJson(request); } catch { return json({ error: "invalid_json" }, 400); }
  if (!body || !validDevice(body.device)) return json({ error: "device" }, 400);
  const device = body.device;
  if (path === "/subscribe") {
    if (!validSubscription(body.subscription)) return json({ error: "subscription" }, 400);
    // Allow only a few family devices; possession of the private pairing token is required.
    const count = await env.DB.prepare("SELECT COUNT(*) AS n FROM devices").first();
    const exists = await env.DB.prepare("SELECT id FROM devices WHERE id=?").bind(device).first();
    if (!exists && count.n >= 5) return json({ error: "device_limit" }, 409);
    await env.DB.prepare("INSERT INTO devices(id,subscription,updated_at) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET subscription=excluded.subscription,updated_at=excluded.updated_at")
      .bind(device, JSON.stringify(body.subscription), now).run();
    return json({ ok: true });
  }
  if (path === "/disable") {
    await env.DB.prepare("DELETE FROM devices WHERE id=?").bind(device).run();
    return json({ ok: true });
  }
  const exists = await env.DB.prepare("SELECT id FROM devices WHERE id=?").bind(device).first();
  if (!exists) return json({ error: "subscription_expired" }, 410);
  if (path === "/sync") {
    let items;
    try { items = validateItems(body.items, now); } catch { return json({ error: "items" }, 400); }
    const encoded = JSON.stringify(items);
    // D1 batch is transactional. Preserve delivered/leased rows when time/content did not change.
    await env.DB.batch([
      env.DB.prepare("DELETE FROM reminders WHERE device=? AND is_test=0 AND id NOT IN (SELECT json_extract(value,'$.id') FROM json_each(?))").bind(device, encoded),
      env.DB.prepare(`INSERT INTO reminders(device,id,at,body)
        SELECT ?,json_extract(value,'$.id'),json_extract(value,'$.at'),json_extract(value,'$.body') FROM json_each(?) WHERE 1
        ON CONFLICT(device,id) DO UPDATE SET at=excluded.at,body=excluded.body,
        state=CASE WHEN reminders.at=excluded.at AND reminders.body=excluded.body THEN reminders.state ELSE 'pending' END,
        attempts=CASE WHEN reminders.at=excluded.at AND reminders.body=excluded.body THEN reminders.attempts ELSE 0 END,
        retry_at=CASE WHEN reminders.at=excluded.at AND reminders.body=excluded.body THEN reminders.retry_at ELSE 0 END,
        lease=CASE WHEN reminders.at=excluded.at AND reminders.body=excluded.body THEN reminders.lease ELSE NULL END`).bind(device, encoded),
      env.DB.prepare("UPDATE devices SET updated_at=? WHERE id=?").bind(now, device),
    ]);
    return json({ ok: true, count: items.length });
  }
  if (path === "/test") {
    const claimed = await env.DB.prepare("UPDATE devices SET last_test=? WHERE id=? AND last_test<? RETURNING id").bind(now, device, now - 60000).first();
    if (!claimed) return json({ error: "wait_one_minute" }, 429);
    await env.DB.prepare("INSERT INTO reminders(device,id,at,body,is_test) VALUES(?,?,?,?,1)")
      .bind(device, `test:${crypto.randomUUID()}`, now + 30000, "Tudo certo, Fabi! Seus avisos online estão chegando.").run();
    return json({ ok: true });
  }
  return json({ error: "not_found" }, 404);
}

export async function deliver(env, now = Date.now(), transport = fetch) {
  // Very late medicine/event notifications are discarded rather than replayed in a burst.
  await env.DB.prepare("DELETE FROM reminders WHERE at<?").bind(now - 10 * 60000).run();
  const due = await env.DB.prepare("SELECT device,id FROM reminders WHERE state='pending' AND retry_at<=? AND at<=? ORDER BY at LIMIT 20").bind(now, now).all();
  for (const candidate of due.results) {
    const lease = crypto.randomUUID();
    const row = await env.DB.prepare("UPDATE reminders SET state='sending',lease=?,retry_at=?,attempts=attempts+1 WHERE device=? AND id=? AND state='pending' AND at<=? AND retry_at<=? RETURNING *")
      .bind(lease, now + 120000, candidate.device, candidate.id, now, now).first();
    if (!row) continue;
    const device = await env.DB.prepare("SELECT subscription FROM devices WHERE id=?").bind(row.device).first();
    if (!device) continue;
    try {
      const subscription = JSON.parse(device.subscription);
      if (!validSubscription(subscription)) throw Error("subscription");
      const payload = await buildPushPayload({
        data: JSON.stringify({ title: "Um sonho de rotina", body: row.body, tag: row.id, at: row.at }),
        options: { ttl: 300, urgency: "high" },
      }, subscription, { subject: env.APP_ORIGIN, publicKey: env.VAPID_PUBLIC_KEY, privateKey: env.VAPID_PRIVATE_KEY });
      // Recheck after encryption: an edit/cancellation may have removed or replaced this lease.
      const current = await env.DB.prepare("SELECT id FROM reminders WHERE device=? AND id=? AND lease=? AND state='sending'").bind(row.device, row.id, lease).first();
      if (!current) continue;
      const result = await transport(subscription.endpoint, { ...payload, redirect: "error", signal: AbortSignal.timeout(10000) });
      if (result.status === 404 || result.status === 410) {
        await env.DB.prepare("DELETE FROM devices WHERE id=? AND subscription=?").bind(row.device, device.subscription).run();
      } else if (result.ok) {
        await env.DB.prepare("UPDATE reminders SET state='sent' WHERE device=? AND id=? AND lease=?").bind(row.device, row.id, lease).run();
      } else if (result.status === 429 || result.status >= 500) {
        throw Error("retry");
      } else {
        await env.DB.prepare("UPDATE reminders SET state='failed' WHERE device=? AND id=? AND lease=?").bind(row.device, row.id, lease).run();
      }
    } catch {
      await env.DB.prepare("UPDATE reminders SET state=?,retry_at=? WHERE device=? AND id=? AND lease=?")
        .bind(row.attempts < 4 ? "pending" : "failed", now + 60000 * row.attempts, row.device, row.id, lease).run();
    }
  }
  // Recover a scheduler execution that stopped mid-request. Duplicate display is coalesced by tag.
  await env.DB.prepare("UPDATE reminders SET state=CASE WHEN attempts<4 THEN 'pending' ELSE 'failed' END WHERE state='sending' AND retry_at<?").bind(now).run();
  await env.DB.prepare("DELETE FROM devices WHERE updated_at<?").bind(now - 367 * DAY).run();
}
export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    if (origin !== env.APP_ORIGIN) return json({ error: "origin" }, 403);
    const headers = { "Access-Control-Allow-Origin": env.APP_ORIGIN, "Access-Control-Allow-Headers": "Authorization, Content-Type", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Vary": "Origin", "Cache-Control": "no-store" };
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    let response;
    try { response = await handle(request, env); } catch { response = json({ error: "service_unavailable" }, 503); }
    for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
    return response;
  },
  async scheduled(_event, env) { await deliver(env); },
};
