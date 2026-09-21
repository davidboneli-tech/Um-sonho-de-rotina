import test from "node:test";
import assert from "node:assert/strict";
import {
  emptyData,
  newEvent,
  occurrences,
  editOccurrence,
  conflictDates,
  freeSlots,
  goalProgress,
  dosesOn,
  dayKey,
  validDay,
  pending,
} from "../src/domain";

test("recurrence edit affects one date and preserves other instances", () => {
  const e = {
    ...newEvent("2026-09-21"),
    repeat: "weekly" as const,
    days: [1],
    title: "Violão",
  };
  const data = emptyData();
  data.events = editOccurrence(
    [e],
    e,
    "2026-09-28",
    { ...e, date: "2026-09-28", title: "Outra música" },
    "one",
  );
  assert.equal(occurrences(data, "2026-09-21")[0].event.title, "Violão");
  assert.equal(occurrences(data, "2026-09-28").length, 1);
  assert.equal(occurrences(data, "2026-09-28")[0].event.title, "Outra música");
  assert.equal(occurrences(data, "2026-10-05")[0].event.title, "Violão");
});
test("editing future series keeps past unchanged", () => {
  const e = {
    ...newEvent("2026-09-21"),
    repeat: "weekly" as const,
    days: [1],
    title: "Antes",
  };
  const data = emptyData();
  data.events = editOccurrence(
    [e],
    e,
    "2026-09-28",
    { ...e, date: "2026-09-28", title: "Depois" },
    "future",
  );
  assert.equal(occurrences(data, "2026-09-21")[0].event.title, "Antes");
  assert.equal(occurrences(data, "2026-10-05")[0].event.title, "Depois");
});
test("conflicts use overlap, not adjacent intervals or tasks without time", () => {
  const e = { ...newEvent("2026-09-21"), start: "09:00", end: "10:00" };
  assert.equal(
    conflictDates([e], { ...e, id: "b", start: "10:00", end: "11:00" }).length,
    0,
  );
  assert.equal(
    conflictDates([e], { ...e, id: "b", start: "09:30", end: "10:30" }).length,
    1,
  );
  assert.equal(conflictDates([e], { ...e, id: "b", mode: "manha" }).length, 0);
});
test("conflict detection includes future repetitions", () => {
  const future = { ...newEvent("2026-10-05"), start: "09:00", end: "10:00" };
  const weekly = {
    ...newEvent("2026-09-21"),
    repeat: "weekly" as const,
    days: [1],
    start: "09:00",
    end: "10:00",
  };
  assert.equal(conflictDates([future], weekly)[0].date, "2026-10-05");
});
test("free time excludes commitments and never suggests the past", () => {
  const d = emptyData();
  d.events = [{ ...newEvent("2026-09-21"), start: "14:00", end: "15:00" }];
  assert.equal(
    freeSlots(d, "2026-09-21", 30, new Date("2026-09-21T14:15:00"))[0].start,
    "15:00",
  );
  assert.deepEqual(
    freeSlots(d, "2026-09-20", 30, new Date("2026-09-21T14:15:00")),
    [],
  );
  d.events.push({ ...newEvent("2026-09-21"), mode: "dia" });
  assert.deepEqual(
    freeSlots(d, "2026-09-21", 30, new Date("2026-09-21T10:00:00")),
    [],
  );
});
test("two medications at same time have distinct confirmation keys", () => {
  const d = emptyData();
  const medicine = {
    id: "a",
    name: "A",
    dose: "cadastro",
    times: ["08:00", "20:00"],
    days: [1],
    startDate: "2026-09-21",
    active: true,
  };
  d.medicines = [medicine, { ...medicine, id: "b", name: "B" }];
  const doses = dosesOn(d, "2026-09-21");
  assert.equal(new Set(doses.map((x) => x.key)).size, 4);
  d.doses[doses[0].key] = "2026-09-21T08:01:00";
  assert.equal(d.doses[doses[1].key], undefined);
});
test("daily progress does not include previous day or another goal", () => {
  const d = emptyData();
  const g = {
    id: "g",
    title: "Ler",
    target: 120,
    image: 3,
    period: "daily" as const,
    paused: false,
    encouragement: "gentle" as const,
  };
  d.activities = [
    { id: "a", goalId: "g", date: "2026-09-21", minutes: 30 },
    { id: "b", goalId: "g", date: "2026-09-20", minutes: 60 },
    { id: "c", goalId: "other", date: "2026-09-21", minutes: 90 },
  ];
  assert.equal(goalProgress(d, g, "2026-09-21"), 30);
  assert.equal(goalProgress(d, { ...g, period: "monthly" }, "2026-09-21"), 90);
});
test("pending list excludes scheduled appointments and completed tasks", () => {
  const d = emptyData();
  const a = { ...newEvent("2026-09-20"), mode: "livre" as const };
  d.events = [a, newEvent("2026-09-20")];
  assert.equal(pending(d, "2026-09-21").length, 1);
  d.done[`${a.id}@2026-09-20`] = "done";
  assert.equal(pending(d, "2026-09-21").length, 0);
});
test("invalid calendar dates rejected", () => {
  assert.equal(validDay("2026-02-30"), false);
  assert.equal(validDay("2028-02-29"), true);
});

import { notificationCandidates } from "../src/notificationModel";
test("notification schedule excludes confirmed doses and finished events", () => {
  const d = emptyData();
  const e = {
    ...newEvent("2026-09-21"),
    start: "10:00",
    end: "11:00",
    reminders: [30],
  };
  d.events = [e];
  d.medicines = [
    {
      id: "med",
      name: "private name",
      dose: "private dose",
      times: ["10:00"],
      days: [1],
      startDate: "2026-09-21",
      endDate: "2026-09-21",
      active: true,
    },
  ];
  const now = new Date("2026-09-21T08:00:00");
  let list = notificationCandidates(d, now);
  assert.equal(list.length, 2);
  assert.equal(
    list.some((x) => x.body.includes("private")),
    false,
  );
  d.doses["med@2026-09-21@10:00"] = "taken";
  d.done[`${e.id}@2026-09-21`] = "done";
  assert.equal(notificationCandidates(d, now).length, 0);
});
