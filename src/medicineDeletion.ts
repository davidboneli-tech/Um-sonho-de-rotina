import { Medicine } from './domain';

export function excludeMedicineDose(medicine: Medicine, date: string, time: string, scope: 'one' | 'future'): Medicine {
  const at = `${date}T${time}`;
  return scope === 'one'
    ? { ...medicine, excludedDoses: [...new Set([...(medicine.excludedDoses || []), at])] }
    : { ...medicine, cancelledFrom: medicine.cancelledFrom && medicine.cancelledFrom < at ? medicine.cancelledFrom : at };
}
