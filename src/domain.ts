export type Mode = "horario" | "manha" | "tarde" | "noite" | "livre" | "dia";
export type Repeat = "none" | "weekly" | "monthly" | "yearly";
export type Event = {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  start: string;
  end: string;
  mode: Mode;
  repeat: Repeat;
  days: number[];
  image: number;
  people: string[];
  category: string;
  priority: string;
  notes: string;
  place: string;
  checklist: string[];
  reminders: number[];
  highlight: boolean;
  exceptions: string[];
  goalId?: string;
};
export type Occurrence = { event: Event; date: string; key: string };
export type Medicine = {
  id: string;
  name: string;
  dose: string;
  times: string[];
  days: number[];
  startDate: string;
  endDate?: string;
  intervalDays?: number;
  active: boolean;
  photo?: string;
};
export type Goal = {
  id: string;
  title: string;
  image: number;
  target: number;
  period: "daily" | "monthly";
  paused: boolean;
  encouragement: "off" | "gentle" | "firm";
};
export type Activity = {
  id: string;
  goalId: string;
  date: string;
  minutes: number;
  occurrenceKey?: string;
};
export type Settings = {
  theme: number;
  color: string;
  font: number;
  large: boolean;
  decoration: number;
  biometric: boolean;
  availableStart: string;
  availableEnd: string;
};
export type Data = {
  version: 1;
  events: Event[];
  medicines: Medicine[];
  goals: Goal[];
  activities: Activity[];
  done: Record<string, string>;
  skipped: Record<string, boolean>;
  checks: Record<string, boolean>;
  doses: Record<string, string>;
  doseHistory: Record<
    string,
    {
      name: string;
      dose: string;
      date: string;
      time: string;
      confirmedAt: string;
    }
  >;
  settings: Settings;
};
export const defaultSettings: Settings = {
  theme: 0,
  color: "",
  font: 0,
  large: false,
  decoration: 1,
  biometric: false,
  availableStart: "14:00",
  availableEnd: "18:00",
};
export const emptyData = (): Data => ({
  version: 1,
  events: [],
  medicines: [],
  goals: [],
  activities: [],
  done: {},
  skipped: {},
  checks: {},
  doses: {},
  doseHistory: {},
  settings: { ...defaultSettings },
});
export const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const parseDay = (s: string) => new Date(`${s}T12:00:00`);
export const addDays = (s: string, n: number) => {
  const d = parseDay(s);
  d.setDate(d.getDate() + n);
  return dayKey(d);
};
export function validDay(s: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(s) &&
    !isNaN(parseDay(s).valueOf()) &&
    dayKey(parseDay(s)) === s
  );
}
export const validTime = (s: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
export const minutes = (s: string) =>
  Number(s.slice(0, 2)) * 60 + Number(s.slice(3));
export const clock = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
export const prettyDay = (s: string) =>
  parseDay(s).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
export const toBrazil = (s: string) => s.split("-").reverse().join("/");
export const fromBrazil = (s: string) =>
  s.includes("/") ? s.split("/").reverse().join("-") : s;
export function occurs(e: Event, date: string): boolean {
  if (
    date < e.date ||
    (e.endDate && date > e.endDate) ||
    e.exceptions.includes(date)
  )
    return false;
  const d = parseDay(date),
    base = parseDay(e.date);
  if (e.repeat === "none") return e.date === date;
  if (e.repeat === "weekly") return e.days.includes(d.getDay());
  if (e.repeat === "monthly") return d.getDate() === base.getDate();
  return d.getMonth() === base.getMonth() && d.getDate() === base.getDate();
}
export function occurrences(data: Data, date: string): Occurrence[] {
  return data.events
    .filter((e) => occurs(e, date))
    .map((event) => ({ event, date, key: `${event.id}@${date}` }))
    .sort((a, b) =>
      (a.event.mode === "horario" ? a.event.start : "99:99").localeCompare(
        b.event.mode === "horario" ? b.event.start : "99:99",
      ),
    );
}
export function conflictDates(events: Event[], candidate: Event): Occurrence[] {
  if (candidate.mode !== "horario") return [];
  const result: Occurrence[] = [];
  // Check a full year of recurring occurrences, including annual commitments.
  for (let i = 0; i < (candidate.repeat === "none" ? 1 : 366); i++) {
    const date = addDays(candidate.date, i);
    if (!occurs(candidate, date)) continue;
    for (const e of events)
      if (
        e.id !== candidate.id &&
        e.mode === "horario" &&
        occurs(e, date) &&
        minutes(candidate.start) < minutes(e.end) &&
        minutes(e.start) < minutes(candidate.end)
      ) {
        result.push({ event: e, date, key: `${e.id}@${date}` });
        if (result.length >= 4) return result;
      }
  }
  return result;
}
export function editOccurrence(
  events: Event[],
  original: Event,
  date: string,
  replacement: Event,
  scope: "one" | "future",
): Event[] {
  if (original.repeat === "none")
    return events.map((e) =>
      e.id === original.id ? { ...replacement, id: original.id } : e,
    );
  const previous = events.map((e) =>
    e.id !== original.id
      ? e
      : scope === "one"
        ? { ...e, exceptions: [...new Set([...e.exceptions, date])] }
        : { ...e, endDate: addDays(date, -1) },
  );
  return [
    ...previous,
    {
      ...replacement,
      id: uid(),
      repeat: scope === "one" ? "none" : replacement.repeat,
      exceptions: [],
      date: replacement.date,
    },
  ];
}
export function goalProgress(data: Data, goal: Goal, date: string): number {
  return data.activities
    .filter(
      (a) =>
        a.goalId === goal.id &&
        (goal.period === "daily"
          ? a.date === date
          : a.date.slice(0, 7) === date.slice(0, 7)),
    )
    .reduce((n, a) => n + a.minutes, 0);
}
export function freeSlots(
  data: Data,
  date: string,
  duration: number,
  now = new Date(),
): { start: string; end: string }[] {
  if (!Number.isFinite(duration) || duration <= 0) return [];
  const all = occurrences(data, date).filter((o) => !data.skipped[o.key]);
  if (all.some((o) => o.event.mode === "dia")) return [];
  const busy = all.filter((o) => o.event.mode === "horario");
  const lower =
    date === dayKey(now)
      ? Math.max(
          minutes(data.settings.availableStart),
          Math.ceil((now.getHours() * 60 + now.getMinutes()) / 15) * 15,
        )
      : minutes(data.settings.availableStart);
  if (date < dayKey(now)) return [];
  const result: { start: string; end: string }[] = [];
  for (
    let t = lower;
    t + duration <= minutes(data.settings.availableEnd);
    t += 15
  ) {
    if (
      !busy.some(
        (o) =>
          t < minutes(o.event.end) && minutes(o.event.start) < t + duration,
      )
    )
      result.push({ start: clock(t), end: clock(t + duration) });
    if (result.length === 3) break;
  }
  return result;
}
export function pending(data: Data, today: string): Occurrence[] {
  const oldest = data.events.reduce((d, e) => (e.date < d ? e.date : d), today);
  const result: Occurrence[] = [];
  for (let date = oldest; date < today; date = addDays(date, 1)) {
    for (const o of occurrences(data, date))
      if (
        o.event.mode !== "horario" &&
        !data.done[o.key] &&
        !data.skipped[o.key]
      )
        result.push(o);
  }
  return result.reverse();
}
export const doseKey = (id: string, date: string, time: string) =>
  `${id}@${date}@${time}`;
export function medicineOn(m: Medicine, date: string): boolean {
  if (!m.active || date < m.startDate || (m.endDate && date > m.endDate)) return false;
  if (m.intervalDays !== undefined) {
    if (!Number.isInteger(m.intervalDays) || m.intervalDays < 1) return false;
    // Calendar-day arithmetic, unaffected by daylight-saving transitions.
    const elapsed = (Date.parse(date + 'T00:00:00Z') - Date.parse(m.startDate + 'T00:00:00Z')) / 86400000;
    return elapsed % m.intervalDays === 0;
  }
  return m.days.includes(parseDay(date).getDay());
}
export function dosesOn(data: Data, date: string) {
  return data.medicines
    .filter(
      (m) =>
        medicineOn(m, date),
    )
    .flatMap((medicine) =>
      medicine.times.map((time) => ({
        medicine,
        time,
        key: doseKey(medicine.id, date, time),
      })),
    )
    .sort((a, b) => a.time.localeCompare(b.time));
}
export function newEvent(date = dayKey()): Event {
  return {
    id: uid(),
    title: "",
    date,
    start: "09:00",
    end: "10:00",
    mode: "horario",
    repeat: "none",
    days: [parseDay(date).getDay()],
    image: 0,
    people: ["Fabi"],
    category: "Pessoal",
    priority: "Importante",
    notes: "",
    place: "",
    checklist: [],
    reminders: [30],
    highlight: false,
    exceptions: [],
  };
}
