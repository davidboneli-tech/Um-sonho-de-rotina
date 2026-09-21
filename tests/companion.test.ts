import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyData, newEvent, Goal, dosesOn } from '../src/domain';
import { goalScene, todayMoment } from '../src/companion';

const now = new Date(2026, 8, 21, 9, 0);
const date = '2026-09-21';
const goal: Goal = { id: 'g', title: 'Ler um livro', image: 0, target: 30, period: 'daily', paused: false, encouragement: 'gentle' };

test('goal scenes use context independently of the selected illustration', () => {
  assert.equal(goalScene(goal), 'read');
  assert.equal(goalScene({ ...goal, title: 'Caminhar de manhã' }), 'walk');
  assert.equal(goalScene({ ...goal, encouragement: 'firm' }), 'attention');
  assert.equal(goalScene({ ...goal, title: 'Praticar violão' }), 'suggestion');
});

test('upcoming reminder takes priority, skips cancelled and done events, then celebrates current progress', () => {
  const data = emptyData();
  data.goals = [goal];
  data.activities = [{ id: 'a', goalId: 'g', date, minutes: 30 }];
  const event = { ...newEvent(date), id: 'e', title: 'Consulta', mode: 'horario' as const, start: '09:15' };
  data.events = [event];
  assert.equal(todayMoment(data, now)?.scene, 'reminder');
  data.skipped['e@' + date] = true;
  assert.equal(todayMoment(data, now)?.scene, 'celebrate');
  data.skipped = {}; data.done['e@' + date] = now.toISOString();
  assert.equal(todayMoment(data, now)?.scene, 'celebrate');
  data.activities[0].minutes = 10;
  assert.equal(todayMoment(data, now)?.scene, 'rest');
});

test('rest does not claim an empty agenda while a dose or untimed task is pending', () => {
  const data = emptyData();
  data.medicines = [{ id: 'm', name: 'Medicamento', dose: '1', times: ['08:00'], days: [1], startDate: date, active: true }];
  assert.equal(todayMoment(data, now), null);
  data.doses[dosesOn(data, date)[0].key] = now.toISOString();
  assert.equal(todayMoment(data, now)?.scene, 'rest');
  data.events = [{ ...newEvent(date), mode: 'livre' }];
  assert.equal(todayMoment(data, now), null);
});
