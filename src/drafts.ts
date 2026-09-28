import { useRef, useState, Dispatch, SetStateAction } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DraftStore } from './draftModel';

const key = 'sonho.draft.v1';
let reportError = (_message: string) => {};
let writes = Promise.resolve();
const error = () => reportError('Não foi possível guardar o rascunho neste aparelho. Mantenha esta tela aberta e salve seu cadastro.');
export const drafts = new DraftStore(raw => {
  if (Platform.OS === 'web') {
    try { raw === null ? localStorage.removeItem(key) : localStorage.setItem(key, raw); } catch { error(); }
  } else {
    writes = writes.then(() => raw === null ? AsyncStorage.removeItem(key) : AsyncStorage.setItem(key, raw)).catch(error);
  }
});
export async function loadDraft(onError: (message: string) => void) {
  reportError = onError;
  try { drafts.restore(Platform.OS === 'web' ? localStorage.getItem(key) : await AsyncStorage.getItem(key)); }
  catch { onError('Não foi possível recuperar o rascunho. Os cadastros salvos continuam na agenda.'); }
  return drafts.current;
}
export function useDraftState<T>(key: string, initial: T | (() => T)): [T, Dispatch<SetStateAction<T>>] {
  const generation = useRef(drafts.generation).current;
  const [value, setValue] = useState<T>(() => {
    const fields = drafts.current?.fields;
    return fields && Object.prototype.hasOwnProperty.call(fields, key) ? fields[key] as T : typeof initial === 'function' ? (initial as () => T)() : initial;
  });
  const current = useRef(value);
  const set: Dispatch<SetStateAction<T>> = next => {
    const resolved = typeof next === 'function' ? (next as (value: T) => T)(current.current) : next;
    current.current = resolved;
    drafts.update(key, resolved, generation);
    setValue(resolved);
  };
  return [value, set];
}
