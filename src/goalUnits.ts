import { Goal } from './domain';

// Keep stored goals and activity history in minutes, regardless of display unit.
export function goalMinutes(value: string, period: Goal['period']): number | null {
  const amount = Number(value.trim().replace(',', '.'));
  if (!Number.isFinite(amount) || amount <= 0) return null;
  if (period === 'daily' && (!Number.isInteger(amount) || amount > 1440)) return null;
  if (period === 'monthly' && amount > 744) return null;
  const minutes = Math.round(amount * (period === 'daily' ? 1 : 60));
  return minutes >= 1 ? minutes : null;
}

export function goalAmount(minutes: number, period: Goal['period'], unit = true): string {
  const amount = period === 'daily' ? minutes : minutes / 60;
  const text = amount.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  return unit ? `${text} ${period === 'daily' ? 'min' : 'h'}` : text;
}
