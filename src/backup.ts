import { Data, defaultSettings, validDay, validTime } from './domain';
const object = (v: any) => v && typeof v === 'object' && !Array.isArray(v);
const strings = (v: any) => Array.isArray(v) && v.every(x => typeof x === 'string');
const days = (v: any) => Array.isArray(v) && v.every(x => Number.isInteger(x) && x >= 0 && x <= 6);
const str = (v: any, keys: string[]) => keys.every(k => typeof v[k] === 'string');
const number = (v: any) => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const map = (v: any, type: string) => object(v) && Object.values(v).every(x => typeof x === type);
export function parseBackup(text: string): Data {
  if (text.length > 20_000_000) throw new Error('Backup muito grande (limite de 20 MB).');
  const wrapper = JSON.parse(text);
  const d = wrapper?.format === 'sonho-backup-v1' ? wrapper.data : null;
  const fail = () => { throw new Error('Backup inválido ou incompatível. Seus dados não foram alterados.'); };
  if (!object(d) || d.version !== 1) return fail();
  if (!Array.isArray(d.events) || !d.events.every((e: any) => object(e) && str(e,['id','title','date','start','end','category','priority','notes','place']) && validDay(e.date) && (!e.endDate || validDay(e.endDate)) && validTime(e.start) && validTime(e.end) && ['horario','manha','tarde','noite','livre','dia'].includes(e.mode) && ['none','weekly','monthly','yearly'].includes(e.repeat) && days(e.days) && number(e.image) && strings(e.people) && strings(e.checklist) && strings(e.exceptions) && Array.isArray(e.reminders) && e.reminders.every(number) && typeof e.highlight === 'boolean')) return fail();
  if (!Array.isArray(d.medicines) || !d.medicines.every((m: any) => object(m) && str(m,['id','name','dose','startDate']) && validDay(m.startDate) && (!m.endDate || validDay(m.endDate)) && strings(m.times) && m.times.every(validTime) && days(m.days) && typeof m.active === 'boolean' && (!m.photo || (typeof m.photo === 'string' && /^data:image\/(png|jpeg|webp);base64,/.test(m.photo))))) return fail();
  if (!Array.isArray(d.goals) || !d.goals.every((g: any) => object(g) && str(g,['id','title']) && number(g.image) && number(g.target) && g.target > 0 && ['daily','monthly'].includes(g.period) && ['off','gentle','firm'].includes(g.encouragement) && typeof g.paused === 'boolean')) return fail();
  if (!Array.isArray(d.activities) || !d.activities.every((a: any) => object(a) && str(a,['id','goalId','date']) && validDay(a.date) && number(a.minutes))) return fail();
  if (!map(d.done,'string') || !map(d.doses,'string') || !map(d.skipped,'boolean') || !map(d.checks,'boolean')) return fail();
  if (!object(d.doseHistory) || !Object.values(d.doseHistory).every((h: any) => object(h) && str(h,['name','dose','date','time','confirmedAt']) && validDay(h.date) && validTime(h.time))) return fail();
  const s = d.settings;
  if (!object(s) || ![0,1,2,3,4].includes(s.theme) || ![0,1,2].includes(s.font) || ![0,1,2].includes(s.decoration) || typeof s.large !== 'boolean' || typeof s.color !== 'string' || (s.color && !/^#[0-9a-f]{6}$/i.test(s.color)) || !validTime(s.availableStart) || !validTime(s.availableEnd)) return fail();
  for (const key of ['events','medicines','goals','activities']) if (new Set(d[key].map((x: any) => x.id)).size !== d[key].length) return fail();
  return {...d, settings:{...defaultSettings,...s,biometric:false}};
}
export function backupText(data: Data) {
  return JSON.stringify({format:'sonho-backup-v1', exportedAt:new Date().toISOString(), data}, null, 2);
}
