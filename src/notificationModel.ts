import { Data, dayKey, addDays, occurrences, dosesOn } from "./domain";
export function notificationCandidates(data: Data, now = new Date()) {
  const list: { id: string; at: Date; title: string; body: string }[] = [];
  for (let i = 0; i < 366; i++) {
    const day = addDays(dayKey(now), i);
    for (const o of occurrences(data, day)) {
      if (data.done[o.key] || data.skipped[o.key]) continue;
      const time =
        o.event.mode === "horario"
          ? o.event.start
          : o.event.mode === "tarde"
            ? "14:00"
            : o.event.mode === "noite"
              ? "19:00"
              : "09:00";
      for (const offset of o.event.reminders) {
        const at = new Date(
          new Date(`${day}T${time}:00`).getTime() - offset * 60000,
        );
        if (at > now)
          list.push({
            id: `${o.key}:${offset}`,
            at,
            title: "Um sonho de rotina",
            body: `Você tem um compromisso às ${time}. Abra sua agenda para conferir.`,
          });
      }
    }
    for (const dose of dosesOn(data, day)) {
      const at = new Date(`${day}T${dose.time}:00`);
      if (at > now && !data.doses[dose.key])
        list.push({
          id: dose.key,
          at,
          title: "Um sonho de rotina",
          body: "Há um lembrete de medicamento. Confira o registro no aplicativo.",
        });
    }
  }
  return list.sort((a, b) => a.at.getTime() - b.at.getTime());
}
