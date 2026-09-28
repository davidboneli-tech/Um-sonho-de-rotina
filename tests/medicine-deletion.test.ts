import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyData, dosesOn, Medicine } from '../src/domain';
import { excludeMedicineDose } from '../src/medicineDeletion';
import { notificationCandidates } from '../src/notificationModel';
import { backupText, parseBackup } from '../src/backup';

const medicine: Medicine = { id: 'm', name: 'Exemplo', dose: 'Cadastro', times: ['08:00','20:00'], days: [], intervalDays: 15, startDate: '2026-09-01', active: true };
test('remove one dose keeps the other time and next interval, including notifications', () => {
  const data = emptyData();
  data.medicines = [excludeMedicineDose(medicine, '2026-09-16', '08:00', 'one')];
  assert.deepEqual(dosesOn(data,'2026-09-16').map(d=>d.time), ['20:00']);
  assert.equal(dosesOn(data,'2026-10-01').length,2);
  assert.equal(notificationCandidates(data,new Date(2026,8,16,7)).filter(n=>n.at.getDate()===16 && n.at.getMonth()===8).length,1);
  assert.deepEqual(parseBackup(backupText(data)).medicines,data.medicines);
});
test('future removal keeps earlier dose and history, and clears future alerts', () => {
  const data=emptyData();
  data.medicines=[excludeMedicineDose(medicine,'2026-09-16','20:00','future')];
  assert.deepEqual(dosesOn(data,'2026-09-16').map(d=>d.time),['08:00']);
  assert.equal(dosesOn(data,'2026-10-01').length,0);
  assert.equal(notificationCandidates(data,new Date(2026,8,16,9)).length,0);
  const key=dosesOn(data,'2026-09-01')[0].key;
  data.doses[key]='confirmed';
  data.doseHistory[key]={name:medicine.name,dose:medicine.dose,time:'08:00',date:'2026-09-01',confirmedAt:'2026-09-01T08:00:00Z'};
  const history={...data.doseHistory};
  data.medicines=[];
  assert.deepEqual(parseBackup(backupText(data)).doseHistory,history);
});
test('backup rejects malformed dose exclusions', () => {
  const data=emptyData();
  for (const at of ['2026-02-30T08:00','2026-09-01T25:00','invalid']) {
    data.medicines=[{...medicine,excludedDoses:[at]}];
    assert.throws(()=>parseBackup(backupText(data)));
    data.medicines=[{...medicine,cancelledFrom:at}];
    assert.throws(()=>parseBackup(backupText(data)));
  }
});
