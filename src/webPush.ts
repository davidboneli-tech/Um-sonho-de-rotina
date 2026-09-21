import { Data } from "./domain";
import { notificationCandidates } from "./notificationModel";
import { PUSH_API_URL } from "./pushConfig";

const KEY = "sonho.push.v1";
type State = { token: string; device: string; enabled: boolean; pendingDisable?: boolean };
const read = (): State | null => {
  try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; }
};
const write = (state: State) => localStorage.setItem(KEY, JSON.stringify(state));
export const webPushConfigured = () => !!PUSH_API_URL;
export const webPushPaired = () => !!read()?.token;
let latestData: Data | null = null;
let queue = Promise.resolve("");
let lastPayload = "";

function support() {
  if (!PUSH_API_URL) throw Error("Os lembretes online aguardam a configuração do serviço de envio.");
  if (!window.isSecureContext || !("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window))
    throw Error("No iPhone, abra pelo ícone instalado na Tela de Início para ativar os avisos.");
}
async function registration() {
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<never>((_, reject) => setTimeout(() => reject(Error("Atualize o app em Ajustes e tente novamente.")), 10000)),
  ]);
}
async function api(path: string, body?: unknown, token = read()?.token) {
  if (!navigator.onLine) throw Error("Sem conexão. Abra o app com internet para atualizar os avisos.");
  const response = await fetch(`${PUSH_API_URL}${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token || ""}` },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    if (response.status === 401) throw Error("Código de ativação inválido. Confira o código e tente novamente.");
    if (response.status === 410) throw Error("Os avisos deste aparelho expiraram. Toque em Ativar notificações novamente.");
    throw Error("Não foi possível atualizar os avisos online. Tente novamente com internet.");
  }
  return response.json();
}
export async function pairWebPush(token: string) {
  support();
  const clean = token.trim();
  if (!/^[A-Za-z0-9_-]{32,128}$/.test(clean)) throw Error("Confira o código de ativação.");
  await api("/config", undefined, clean);
  const old = read();
  write({ token: clean, device: old?.device || crypto.randomUUID(), enabled: false });
  lastPayload = "";
}
export async function enableWebPush() {
  support();
  const state = read();
  if (!state) throw Error("Conecte este aparelho com o código de ativação primeiro.");
  // Invoke on the tap, before any network awaits, as required by iOS.
  if (await Notification.requestPermission() !== "granted") return false;
  const [config, reg] = await Promise.all([api("/config"), registration()]);
  const key = Uint8Array.from(atob(config.publicKey.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
  let sub = await reg.pushManager.getSubscription();
  if (sub && JSON.stringify(Array.from(new Uint8Array(sub.options.applicationServerKey!))) !== JSON.stringify(Array.from(key))) {
    await sub.unsubscribe(); sub = null;
  }
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
  await api("/subscribe", { device: state.device, subscription: sub.toJSON() });
  write({ ...state, enabled: true, pendingDisable: false });
  lastPayload = "";
  return true;
}
async function sync(data: Data): Promise<string> {
  if (!PUSH_API_URL) return "Os lembretes online aguardam a configuração do serviço de envio.";
  const state = read();
  if (!state) return "Conecte este aparelho e permita as notificações para receber lembretes.";
  if (state.pendingDisable) {
    await api("/disable", { device: state.device });
    write({ ...state, pendingDisable: false });
  }
  if (!state.enabled) return "Notificações desativadas neste aparelho.";
  if (!("Notification" in window) || Notification.permission !== "granted") {
    await api("/disable", { device: state.device });
    write({ ...state, enabled: false });
    return "Permissão desativada. Confira os ajustes de notificações do iPhone.";
  }
  const reg = await registration();
  const subscription = await reg.pushManager.getSubscription();
  if (!subscription) return "Ative novamente as notificações deste aparelho.";
  const all = notificationCandidates(data);
  const chosen = all.slice(0, 4000);
  const items = chosen.map(item => ({ id: item.id, at: item.at.getTime(), body: item.body }));
  const payload = JSON.stringify({ device: state.device, items });
  // No uploads of notes, names, doses, goals, or the rest of the agenda.
  if (payload !== lastPayload) { await api("/sync", JSON.parse(payload)); lastPayload = payload; }
  const health = await api(`/status?device=${encodeURIComponent(state.device)}`);
  if (health.failed) return "Alguns avisos não puderam ser enviados. Confira sua agenda e teste as notificações em Ajustes.";
  const suffix = chosen.length ? ` ${chosen.length} avisos programados até ${chosen[chosen.length - 1].at.toLocaleDateString("pt-BR")}.` : " Nenhum aviso futuro programado.";
  return `Avisos online sincronizados.${suffix} Abra a agenda regularmente para renovar. A entrega depende da internet e dos ajustes do iPhone.`;
}
export function syncWebPush(data: Data) {
  latestData = data;
  // Serialize updates so a slow old request cannot overwrite a newer edit.
  const job = queue.catch(() => "").then(() => sync(latestData!));
  queue = job;
  return job;
}
export async function disableWebPush() {
  const state = read();
  if (!state) return;
  write({ ...state, enabled: false, pendingDisable: true });
  lastPayload = "";
  // Wait for any in-flight sync before removing the server schedule.
  await queue.catch(() => "");
  const reg = await registration();
  await (await reg.pushManager.getSubscription())?.unsubscribe();
  await api("/disable", { device: state.device });
  write({ ...state, enabled: false, pendingDisable: false });
}
export async function testWebPush() {
  const state = read();
  if (!state?.enabled) throw Error("Ative as notificações primeiro.");
  await api("/test", { device: state.device });
  return "Teste agendado para daqui a cerca de 1 minuto. Feche o app e aguarde o aviso na tela bloqueada.";
}
