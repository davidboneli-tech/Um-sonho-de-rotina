import { generateKeyPairSync, randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";
const { privateKey } = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
const jwk = privateKey.export({ format: "jwk" });
const publicKey = Buffer.concat([Buffer.from([4]), Buffer.from(jwk.x, "base64url"), Buffer.from(jwk.y, "base64url")]).toString("base64url");
// Local ignored file; secrets never enter the app bundle or a commit.
writeFileSync(".push-secrets.json", JSON.stringify({ PUSH_TOKEN: randomBytes(32).toString("base64url"), VAPID_PUBLIC_KEY: publicKey, VAPID_PRIVATE_KEY: jwk.d }, null, 2), { flag: "wx", mode: 0o600 });
console.log("Chaves salvas em .push-secrets.json. Não publique nem envie este arquivo. Use wrangler secret bulk .push-secrets.json.");
