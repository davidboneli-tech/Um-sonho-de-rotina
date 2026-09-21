import AsyncStorage from '@react-native-async-storage/async-storage';
const key = 'sonho.backup-confirmed.v1';
export const backupDue = (last: number | null, now = Date.now()) => last === null || now - last >= 7 * 86400000;
export async function lastBackup(): Promise<number | null> {
  const value = await AsyncStorage.getItem(key);
  const time = value ? Number(value) : NaN;
  return Number.isFinite(time) && time > 0 ? time : null;
}
export async function confirmBackup() { await AsyncStorage.setItem(key, String(Date.now())); }
