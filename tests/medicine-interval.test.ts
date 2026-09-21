import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyData, Medicine, dosesOn } from '../src/domain';
import { notificationCandidates } from '../src/notificationModel';
import { backupText, parseBackup } from '../src/backup';
import { backupDue } from '../src/backupReminder';

const medicine: Medicine = { id: 'm', name: 'Exemplo', dose: 'Conforme cadastro', times: ['08:00'], days: [], intervalDays: 15, startDate: '2026-01-25', active: true };
test('15-day medication spans months and respects start, end, pause and notification dates', () => {
  const data = emptyData(); data.medicines = [{ ...medicine, endDate: '2026-02-24' }];
  for (const day of ['2026-01-25', '2026-02-09', '2026-02-24']) assert.equal(dosesOn(data, day).length, 1);
  for (const day of ['2026-01-24', '2026-02-08', '2026-02-10', '2026-03-11']) assert.equal(dosesOn(data, day).length, 0);
  const candidates = notificationCandidates(data, new Date(2026, 0, 25, 7));
  assert.equal(candidates.length, 3);
  data.doses[dosesOn(data, '2026-02-09')[0].key] = 'confirmed';
  assert.equal(notificationCandidates(data, new Date(2026, 0, 25, 7)).length, 2);
  data.medicines[0].active = false;
  assert.equal(dosesOn(data, '2026-02-24').length, 0);
});
test('weekly legacy medication stays compatible and backup preserves validated intervals', () => {
  const data = emptyData(); data.medicines = [{ ...medicine, intervalDays: undefined, days: [1] }];
  assert.equal(dosesOn(data, '2026-01-26').length, 1);
  assert.equal(dosesOn(data, '2026-01-27').length, 0);
  data.medicines = [medicine];
  assert.equal(parseBackup(backupText(data)).medicines[0].intervalDays, 15);
  for (const intervalDays of [0, -1, 1.5, 366]) {
    data.medicines = [{ ...medicine, intervalDays }];
    assert.throws(() => parseBackup(backupText(data)));
  }
});
test('weekly reminder remains due until confirmed and waits seven full days', () => {
  const now = Date.now();
  assert.equal(backupDue(null, now), true);
  assert.equal(backupDue(now, now + 7 * 86400000 - 1), false);
  assert.equal(backupDue(now, now + 7 * 86400000), true);
});
