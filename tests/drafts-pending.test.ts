import test from 'node:test';
import assert from 'node:assert/strict';
import { DraftStore } from '../src/draftModel';
import { emptyData, newEvent, pending, occurrences, editOccurrence } from '../src/domain';
import { parseBackup, backupText } from '../src/backup';

test('draft keeps unfinished input and photo across reload, and ignores late updates after discard', () => {
  let raw: string | null = null;
  const write = (s: string | null) => { raw = s; };
  const d = new DraftStore(write);
  d.begin({ kind: 'event', event: newEvent('2026-09-28') }, 'Calendário', '2026-09-28');
  const generation = d.generation;
  d.update('date', '28/0', generation);
  d.update('event', { ...d.current!.screen, photo: 'data:image/jpeg;base64,YQ==' }, generation);
  const restored = new DraftStore(write); restored.restore(raw);
  assert.equal(restored.current!.fields.date, '28/0');
  assert.equal(restored.current!.tab, 'Calendário');
  assert.deepEqual(restored.current!.fields.event, d.current!.fields.event);
  d.clear(); d.update('event', { title: 'late photo' }, generation);
  assert.equal(raw, null);
  assert.equal(d.current, null);
});

test('pending recurrence preserves original date and next occurrence after completing, skipping or rescheduling', () => {
  const data = emptyData();
  const event = { ...newEvent('2026-09-14'), title: 'Rotina', repeat: 'weekly' as const, days: [1] };
  data.events = [event];
  const items = pending(data, '2026-09-28');
  assert.deepEqual(items.map(o => o.date), ['2026-09-21','2026-09-14']);
  data.done[items[1].key] = 'done';
  data.skipped[items[0].key] = true;
  assert.equal(pending(data,'2026-09-28').length,0);
  assert.equal(occurrences(data,'2026-09-28').length,1);
  data.skipped = {};
  data.events = editOccurrence(data.events,event,items[0].date,{...event,date:'2026-09-29'},'one');
  assert.equal(pending(data,'2026-09-28').length,0);
  assert.equal(occurrences(data,'2026-09-29').length,1);
  assert.equal(occurrences(data,'2026-10-05').length,1);
  data.medicines = [{ id: 'm', name: 'M', dose:'1', days:[1],times:['08:00'],startDate:'2026-09-14',active:true }];
  assert.equal(pending(data,'2026-09-28').length,0);
});

test('event photo survives recurrence editing and backup, invalid image URLs are rejected', () => {
  const data = emptyData();
  const event = { ...newEvent('2026-09-28'), photo:'data:image/jpeg;base64,YQ==',repeat:'weekly' as const,days:[1] };
  data.events = editOccurrence([event],event,event.date,{...event,date:'2026-09-29'},'one');
  assert.equal(parseBackup(backupText(data)).events[1].photo,event.photo);
  data.events[0].photo='https://example.com/tracker.png';
  assert.throws(()=>parseBackup(backupText(data)));
});
