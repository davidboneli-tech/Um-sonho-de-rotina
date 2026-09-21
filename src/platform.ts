import { notificationCandidates } from "./notificationModel";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import { pbkdf2Async } from "@noble/hashes/pbkdf2";
import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";
import * as Notifications from "expo-notifications";
import { Data, dayKey, addDays, occurrences, dosesOn } from "./domain";
const DATA_KEY = "sonho.data.v1";
const AUTH_KEY = "sonho.auth.v1";
type Credential = {
  salt: string;
  hash: string;
  recovery: string;
  attempts: number;
  until: number;
};
const secureGet = () =>
  Platform.OS === "web"
    ? AsyncStorage.getItem(AUTH_KEY)
    : SecureStore.getItemAsync(AUTH_KEY);
const secureSet = (value: string) =>
  Platform.OS === "web"
    ? AsyncStorage.setItem(AUTH_KEY, value)
    : SecureStore.setItemAsync(AUTH_KEY, value, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
async function digest(value: string, salt: string) {
  return bytesToHex(
    await pbkdf2Async(sha256, value, salt, { c: 120000, dkLen: 32 }),
  );
}
export async function hasPin() {
  return !!(await secureGet());
}
export async function configurePin(pin: string): Promise<string> {
  if (!/^\d{6}$/.test(pin)) throw new Error("Use seis dígitos.");
  const salt = bytesToHex(await Crypto.getRandomBytesAsync(24));
  const recovery = bytesToHex(
    await Crypto.getRandomBytesAsync(16),
  ).toUpperCase();
  const credential: Credential = {
    salt,
    hash: await digest(pin, salt),
    recovery: await digest(recovery, salt),
    attempts: 0,
    until: 0,
  };
  await secureSet(JSON.stringify(credential));
  return recovery.match(/.{4}/g)!.join("-");
}
export async function verifySecret(secret: string, recovery = false) {
  const raw = await secureGet();
  if (!raw) return false;
  const c = JSON.parse(raw) as Credential;
  if (c.until > Date.now())
    throw new Error("Aguarde um minuto antes de tentar novamente.");
  const hash = await digest(
    recovery ? secret.replace(/[^a-z0-9]/gi, "").toUpperCase() : secret,
    c.salt,
  );
  const ok = hash === (recovery ? c.recovery : c.hash);
  c.attempts = ok ? 0 : c.attempts + 1;
  c.until = !ok && c.attempts % 5 === 0 ? Date.now() + 60000 : 0;
  await secureSet(JSON.stringify(c));
  return ok;
}
let writeQueue = Promise.resolve();
export function saveData(data: Data) {
  const snapshot = JSON.stringify(data);
  const operation = writeQueue.then(() =>
    AsyncStorage.setItem(DATA_KEY, snapshot),
  );
  writeQueue = operation.catch(() => {});
  return operation;
}
export async function loadData(): Promise<Data | null> {
  const raw = await AsyncStorage.getItem(DATA_KEY);
  if (!raw) return null;
  const d = JSON.parse(raw);
  if (
    d.version !== 1 ||
    !Array.isArray(d.events) ||
    !Array.isArray(d.medicines) ||
    !d.settings
  )
    throw new Error(
      "Não foi possível ler os dados. Nenhum registro foi apagado.",
    );
  return d;
}
if (Platform.OS !== "web")
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
export async function requestAlerts(): Promise<boolean> {
  if (Platform.OS === "web")
    throw new Error(
      "Os lembretes locais funcionam na versão instalada no iPhone.",
    );
  const p = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: false, allowSound: false },
  });
  return (
    p.granted ||
    p.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}
let notificationQueue = Promise.resolve("");
export function syncAlerts(data: Data): Promise<string> {
  const job = notificationQueue
    .catch(() => "")
    .then(async () => {
      if (Platform.OS === "web")
        return "Prévia no navegador: notificações disponíveis no iPhone.";
      const permission = await Notifications.getPermissionsAsync();
      if (
        !permission.granted &&
        permission.ios?.status !==
          Notifications.IosAuthorizationStatus.PROVISIONAL
      )
        return "Lembretes desativados. Ative em Ajustes.";
      const candidates = notificationCandidates(data);
      // Leave room below iOS pending-notification capacity; rebuild on every active session.
      const selected = candidates.slice(0, 60);
      await Notifications.cancelAllScheduledNotificationsAsync();
      for (const item of selected)
        await Notifications.scheduleNotificationAsync({
          identifier: item.id,
          content: { title: item.title, body: item.body, sound: false },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: item.at,
          },
        });
      if (!selected.length) return "Nenhum lembrete futuro para agendar.";
      const last = selected[selected.length - 1].at.toLocaleString("pt-BR");
      return `${selected.length} avisos silenciosos programados até ${last}. Abra a agenda regularmente para renovar os próximos avisos.`;
    });
  notificationQueue = job;
  return job;
}
