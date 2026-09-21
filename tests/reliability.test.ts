import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyData, newEvent, editOccurrence } from '../src/domain';
import { notificationCandidates } from '../src/notificationModel';
import { backupText, parseBackup } from '../src/backup';

const now = new Date('2026-09-21T08:00:00');
test('edited and deleted appointments replace their pending notification times', () => {
  const d = emptyData();
  d.events = [{ ...newEvent('2026-09-21'), start: '10:00', reminders: [15] }];
  const original = notificationCandidates(d, now)[0];
  d.events[0].start = '11:00';
  const updated = notificationCandidates(d, now)[0];
  assert.equal(updated.id, original.id);
  assert.equal(updated.at.getTime() - original.at.getTime(), 3600000);
  d.events = [];
  assert.equal(notificationCandidates(d, now).length, 0);
});
test('a recurring exception moves only its own reminder and annual dates recur', () => {
  const d = emptyData();
  const e = { ...newEvent('2026-09-21'), repeat: 'weekly' as const, days: [1], start: '10:00', reminders: [15] };
  d.events = editOccurrence([e], e, '2026-09-28', { ...e, date: '2026-09-28', start: '12:00' }, 'one');
  const list = notificationCandidates(d, now);
  assert.ok(list.some(n => n.at.getTime() === new Date('2026-09-28T11:45:00').getTime()));
  assert.ok(!list.some(n => n.at.getTime() === new Date('2026-09-28T09:45:00').getTime()));
  assert.ok(list.some(n => n.at.getTime() === new Date('2026-10-05T09:45:00').getTime()));
  d.events = [{ ...e, date: '2025-09-22', repeat: 'yearly' }];
  assert.ok(notificationCandidates(d, now).some(n => n.at.getTime() === new Date('2026-09-22T09:45:00').getTime()));
});
test('medication times, confirmation and pause control future alerts', () => {
  const d = emptyData();
  d.medicines = [{ id:'m', name:'Fictício', dose:'Teste', times:['09:00','20:00'], days:[1], startDate:'2026-09-21', endDate:'2026-09-21', active:true }];
  assert.equal(notificationCandidates(d, now).length, 2);
  d.doses['m@2026-09-21@09:00'] = 'confirmed';
  assert.equal(notificationCandidates(d, now).length, 1);
  d.medicines[0].active = false;
  assert.equal(notificationCandidates(d, now).length, 0);
});
test('populated backup round trip preserves agenda, pictures and history in isolation', () => {
  const d = emptyData();
  d.events = [{...newEvent('2026-09-21'), title:'Teste', notes:'Anotação', checklist:['Tarefa']}];
  d.medicines = [{id:'m', name:'Fictício', dose:'Teste', times:['09:00'], days:[1], startDate:'2026-09-21', active:true, photo:'data:image/png;base64,aGVsbG8='}];
  d.doses['m@2026-09-21@09:00'] = '2026-09-21T09:00:00';
  d.doseHistory['m@2026-09-21@09:00'] = {name:'Fictício',dose:'Teste',date:'2026-09-21',time:'09:00',confirmedAt:'2026-09-21T09:00:00'};
  d.goals = [{id:'g',title:'Leitura',target:60,image:3,period:'daily',paused:false,encouragement:'gentle'}];
  d.activities = [{id:'a',goalId:'g',date:'2026-09-21',minutes:20}];
  const text = backupText(d);
  const restored = parseBackup(text);
  assert.deepEqual(restored, d);
  restored.events[0].title = 'Alteração isolada';
  assert.equal(d.events[0].title, 'Teste');
  assert.ok(!text.includes('PUSH_TOKEN'));
  d.events.push({...d.events[0]});
  assert.throws(() => parseBackup(backupText(d)));
});
