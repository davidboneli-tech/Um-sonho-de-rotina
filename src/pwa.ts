export type PwaState = { ready: boolean; update: boolean; error: string };
let state: PwaState = { ready: false, update: false, error: '' };
let registration: ServiceWorkerRegistration | undefined;
const listeners = new Set<(s: PwaState) => void>();
const emit = (s: Partial<PwaState>) => { state = {...state, ...s}; listeners.forEach(fn => fn(state)); };
export function watchPwa(fn: (s: PwaState) => void) { listeners.add(fn); fn(state); return () => { listeners.delete(fn); }; }
export async function startPwa() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  try {
    registration = await navigator.serviceWorker.register('./sw.js', {updateViaCache:'none'});
    emit({ready: !!registration.active, update: !!registration.waiting, error:''});
    registration.addEventListener('updatefound', () => {
      emit({error:''});
      const worker = registration!.installing;
      worker?.addEventListener('statechange', () => {
        if(worker.state === 'installed') emit({update: !!registration!.waiting, error:''});
        if(worker.state === 'redundant') emit({error: 'Não foi possível baixar todos os arquivos. Reconecte e abra novamente.'});
      });
    });
    await navigator.serviceWorker.ready;
    emit({ready:true,error:''});
  } catch { emit({error:'O modo offline ainda não está pronto. Confira a conexão e reabra o app.'}); }
}
export async function checkUpdate() {
  emit({error:''});
  if (!registration) await startPwa();
  else await registration.update();
}
export function applyUpdate() {
  if (!registration?.waiting) return;
  navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), {once:true});
  registration.waiting.postMessage('APPLY_UPDATE');
}
