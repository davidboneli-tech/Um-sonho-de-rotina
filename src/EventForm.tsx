import React, { useState } from "react";
import { View, Pressable } from "react-native";
import {
  Event,
  Occurrence,
  validDay,
  validTime,
  fromBrazil,
  toBrazil,
  minutes,
  parseDay,
  conflictDates,
  editOccurrence,
  Data,
} from "./domain";
import {
  Title,
  Field,
  Choices,
  Check,
  Art,
  Avatar,
  Button,
  Txt,
  styles,
  Page,
  Card,
} from "./ui";
import { illustrations, people } from "./assets";
export function EventForm({
  initial,
  original,
  data,
  commit,
  close,
}: {
  initial: Event;
  original?: Occurrence;
  data: Data;
  commit: (events: Event[]) => void;
  close: () => void;
}) {
  const [e, set] = useState(initial),
    [date, setDate] = useState(toBrazil(initial.date));
  const [reminders, setReminders] = useState(initial.reminders.join(", "));
  const [error, setError] = useState(""),
    [conflicts, setConflicts] = useState<Occurrence[]>([]),
    [imagePicker, setImagePicker] = useState(false);
  const [scope, setScope] = useState<"one" | "future">("one");
  const change = (p: Partial<Event>) => {
    set({ ...e, ...p });
    setConflicts([]);
  };
  const build = () => {
    const r = reminders.trim()
      ? reminders.split(",").map((x) => Number(x.trim()))
      : [];
    const result = {
      ...e,
      title: e.title.trim(),
      date: fromBrazil(date),
      reminders: [...new Set(r)],
    };
    if (!result.title) throw new Error("Escreva o título.");
    if (!validDay(result.date))
      throw new Error("Use uma data válida: DD/MM/AAAA.");
    if (
      result.mode === "horario" &&
      (!validTime(result.start) ||
        !validTime(result.end) ||
        minutes(result.end) <= minutes(result.start))
    )
      throw new Error("Informe início e fim válidos, no mesmo dia.");
    if (result.repeat === "weekly" && !result.days.length)
      throw new Error("Escolha os dias da semana.");
    if (r.some((n) => !Number.isInteger(n) || n < 0 || n > 43200))
      throw new Error(
        "Lembretes: use minutos de 0 a 43200, separados por vírgula.",
      );
    return result;
  };
  const save = (override = false) => {
    try {
      const value = build();
      const newEvents = original
        ? editOccurrence(
            data.events,
            original.event,
            original.date,
            value,
            scope,
          )
        : [...data.events, value];
      const candidate =
        original?.event.repeat !== "none" && original
          ? newEvents[newEvents.length - 1]
          : value;
      const found = conflictDates(
        newEvents.filter((x) => x.id !== candidate.id),
        candidate,
      );
      if (found.length && !override) {
        setConflicts(found);
        return;
      }
      commit(newEvents);
      close();
    } catch (err) {
      setError((err as Error).message);
    }
  };
  return (
    <Page>
      <Button outline onPress={close}>
        Cancelar
      </Button>
      <Title>{original ? "Editar evento" : "Novo evento"}</Title>
      {original && original.event.repeat !== "none" && (
        <>
          <Txt>Aplicar alteração</Txt>
          <Choices
            value={scope}
            onChange={setScope}
            values={[
              { label: "Só desta vez", value: "one" },
              { label: "Esta e as próximas", value: "future" },
            ]}
          />
        </>
      )}
      <View style={styles.row}>
        <Art index={e.image} />
        <Button outline onPress={() => setImagePicker(!imagePicker)}>
          Trocar imagem
        </Button>
      </View>
      {imagePicker && (
        <View style={styles.wrap}>
          {illustrations.map((im, i) => (
            <Pressable
              key={i}
              accessibilityRole="button"
              accessibilityLabel={im.name}
              onPress={() => {
                change({ image: i });
                setImagePicker(false);
              }}
              style={{ width: 94, alignItems: "center" }}
            >
              <Art index={i} size={70} />
              <Txt style={{ fontSize: 12 }}>{im.name}</Txt>
            </Pressable>
          ))}
        </View>
      )}
      <Field
        label="Título"
        value={e.title}
        onChangeText={(title: string) => change({ title })}
      />
      <Txt>Quem participa?</Txt>
      <View style={styles.wrap}>
        {Object.keys(people).map((name) => (
          <Pressable
            key={name}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: e.people.includes(name) }}
            accessibilityLabel={name}
            onPress={() =>
              change({
                people: e.people.includes(name)
                  ? e.people.filter((n) => n !== name)
                  : [...e.people, name],
              })
            }
            style={{
              alignItems: "center",
              padding: 9,
              borderRadius: 15,
              backgroundColor: e.people.includes(name)
                ? "#EBD0DB"
                : "transparent",
            }}
          >
            <Avatar name={name} size={48} />
            <Txt style={{ fontSize: 13 }}>{name}</Txt>
          </Pressable>
        ))}
      </View>
      <Field
        label="Data (DD/MM/AAAA)"
        value={date}
        onChangeText={(v: string) => {
          setDate(v);
          setConflicts([]);
        }}
        keyboardType="numbers-and-punctuation"
      />
      <Txt>Quando?</Txt>
      <Choices
        value={e.mode}
        onChange={(mode) => change({ mode })}
        values={[
          { label: "Com horário", value: "horario" },
          { label: "Manhã", value: "manha" },
          { label: "Tarde", value: "tarde" },
          { label: "Noite", value: "noite" },
          { label: "Sem horário", value: "livre" },
          { label: "Dia inteiro", value: "dia" },
        ]}
      />
      {e.mode === "horario" && (
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field
              label="Início (HH:MM)"
              value={e.start}
              onChangeText={(start: string) => change({ start })}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Field
              label="Fim (HH:MM)"
              value={e.end}
              onChangeText={(end: string) => change({ end })}
            />
          </View>
        </View>
      )}
      <Title small>Repetição</Title>
      <Choices
        value={e.repeat}
        onChange={(repeat) => change({ repeat })}
        values={[
          { label: "Não repetir", value: "none" },
          { label: "Semanal", value: "weekly" },
          { label: "Mensal", value: "monthly" },
          { label: "Anual", value: "yearly" },
        ]}
      />
      {e.repeat === "weekly" && (
        <View style={styles.wrap}>
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d, i) => (
            <Button
              key={i}
              small
              outline={!e.days.includes(i)}
              onPress={() =>
                change({
                  days: e.days.includes(i)
                    ? e.days.filter((n) => n !== i)
                    : [...e.days, i],
                })
              }
            >
              {d}
            </Button>
          ))}
        </View>
      )}
      {e.repeat === "monthly" && (
        <Txt muted>Nos meses sem esse dia, não haverá ocorrência.</Txt>
      )}
      <Field
        label="Categoria"
        value={e.category}
        onChangeText={(category: string) => change({ category })}
      />
      <Choices
        value={e.priority}
        onChange={(priority) => change({ priority })}
        values={["Obrigatório", "Importante", "Se der tempo"].map((value) => ({
          label: value,
          value,
        }))}
      />
      <Check
        checked={e.highlight}
        label="Destacar no calendário mensal"
        onPress={() => change({ highlight: !e.highlight })}
      />
      <Field
        label="Anotações"
        multiline
        value={e.notes}
        onChangeText={(notes: string) => change({ notes })}
      />
      <Field
        label="Checklist (um item por linha)"
        multiline
        value={e.checklist.join("\n")}
        onChangeText={(s: string) => change({ checklist: s.split("\n") })}
      />
      <Field
        label="Local"
        value={e.place}
        onChangeText={(place: string) => change({ place })}
      />
      <Field
        label="Lembretes (minutos antes, separados por vírgula)"
        value={reminders}
        onChangeText={(v: string) => {
          setReminders(v);
          setConflicts([]);
        }}
        placeholder="0, 30, 1440"
      />
      <Txt muted>
        Deixe vazio para não avisar. Sem horário: referência às 9h; tarde às
        14h; noite às 19h. Todos os avisos são silenciosos.
      </Txt>
      {!!error && <Txt style={{ color: "#A22D45" }}>{error}</Txt>}
      {!!conflicts.length && (
        <Card>
          <Title small>Conflito de horário</Title>
          {conflicts.map((c) => (
            <Txt key={c.key}>
              {toBrazil(c.date)} · {c.event.title} · {c.event.start}–
              {c.event.end}
              {c.event.place ? ` · ${c.event.place}` : ""}
            </Txt>
          ))}
          <Button onPress={() => save(true)}>Manter os dois e salvar</Button>
          <Button outline onPress={() => setConflicts([])}>
            Alterar horário
          </Button>
          <Button outline onPress={close}>
            Cancelar cadastro
          </Button>
        </Card>
      )}
      <Button onPress={() => save()}>Salvar evento</Button>
    </Page>
  );
}
