import type { Event, Medicine, Goal, Occurrence } from './domain';

export type FormScreen =
  | { kind: 'event'; event: Event; original?: Occurrence; reschedule?: boolean }
  | { kind: 'medicine'; medicine?: Medicine }
  | { kind: 'goal'; goal?: Goal }
  | { kind: 'activity'; goal: Goal; occurrence?: Occurrence };
export type Draft = { version: 1; screen: FormScreen; tab: string; selected: string; fields: Record<string, unknown> };
export function isForm(screen: { kind: string } | null): screen is FormScreen {
  return !!screen && ['event', 'medicine', 'goal', 'activity'].includes(screen.kind);
}
export function parseDraft(raw: string | null): Draft | null {
  if (!raw) return null;
  const d = JSON.parse(raw);
  if (d.version !== 1 || !isForm(d.screen) || typeof d.tab !== 'string' || typeof d.selected !== 'string' || !d.fields || typeof d.fields !== 'object' || Array.isArray(d.fields)) return null;
  if (d.screen.kind === 'event' && !d.screen.event?.id) return null;
  if (d.screen.kind === 'activity' && !d.screen.goal?.id) return null;
  return d;
}
export class DraftStore {
  current: Draft | null = null;
  generation = 0;
  constructor(private write: (raw: string | null) => void) {}
  restore(raw: string | null) { this.current = parseDraft(raw); this.generation++; }
  begin(screen: FormScreen, tab: string, selected: string) {
    this.current = { version: 1, screen, tab, selected, fields: {} };
    this.generation++;
    this.persist();
  }
  update(key: string, value: unknown, generation: number) {
    if (!this.current || generation !== this.generation) return;
    this.current.fields[key] = value;
    this.persist();
  }
  clear() { this.current = null; this.generation++; this.persist(); }
  private persist() { this.write(this.current ? JSON.stringify(this.current) : null); }
}
