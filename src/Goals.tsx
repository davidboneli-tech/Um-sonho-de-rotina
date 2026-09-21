import React, { useState } from "react";
import { View, Image } from "react-native";
import {
  Data,
  Goal,
  Occurrence,
  dayKey,
  uid,
  goalProgress,
  freeSlots,
  newEvent,
  toBrazil,
  fromBrazil,
  validDay,
} from "./domain";
import {
  Page,
  Title,
  Button,
  Card,
  Field,
  Txt,
  Art,
  ArtPicker,
  Choices,
  styles,
  useTheme,
} from "./ui";
import { fabiSuggestion, illustrations } from "./assets";
export function GoalForm({
  value,
  save,
  close,
}: {
  value?: Goal;
  save: (g: Goal) => void;
  close: () => void;
}) {
  const [g, set] = useState<Goal>(
    value || {
      id: uid(),
      title: "",
      image: 4,
      period: "monthly",
      target: 600,
      paused: false,
      encouragement: "gentle",
    },
  );
  const [hours, setHours] = useState(String(g.target / 60)),
    [error, setError] = useState("");
  return (
    <Page>
      <Button outline onPress={close}>
        Cancelar
      </Button>
      <Title>{value ? "Editar objetivo" : "Novo objetivo"}</Title>
      <Field
        label="O que você quer fazer?"
        value={g.title}
        onChangeText={(title: string) => set({ ...g, title })}
      />
      <Txt muted>Escolha uma imagem · deslize para ver mais</Txt>
      <ArtPicker value={g.image} onChange={(image) => set({ ...g, image })} />
      <Txt muted>{illustrations[g.image]?.name}</Txt>
      <Field
        label="Meta em horas"
        value={hours}
        onChangeText={setHours}
        keyboardType="decimal-pad"
      />
      <Choices
        value={g.period}
        onChange={(period) => set({ ...g, period })}
        values={[
          { label: "Por dia", value: "daily" },
          { label: "Por mês", value: "monthly" },
        ]}
      />
      <Title small>Como acompanhar?</Title>
      <Choices
        value={g.encouragement}
        onChange={(encouragement) => set({ ...g, encouragement })}
        values={[
          { label: "Só acompanhar", value: "off" },
          { label: "Incentivo gentil", value: "gentle" },
          { label: "Lembrete firme", value: "firm" },
        ]}
      />
      <Txt muted>
        Os incentivos aparecem ao abrir a agenda, sem sons nem interrupções.
        Você confirma qualquer novo horário.
      </Txt>
      {!!error && <Txt style={{ color: "#A02D43" }}>{error}</Txt>}
      <Button
        onPress={() => {
          const h = Number(hours.replace(",", "."));
          if (!g.title.trim() || !Number.isFinite(h) || h <= 0 || h > 744) {
            setError("Informe título e uma meta válida em horas.");
            return;
          }
          save({ ...g, title: g.title.trim(), target: Math.round(h * 60) });
          close();
        }}
      >
        Salvar objetivo
      </Button>
    </Page>
  );
}
export function ActivityForm({
  goal,
  occurrence,
  save,
  close,
}: {
  goal: Goal;
  occurrence?: Occurrence;
  save: (minutes: number, date: string) => void;
  close: () => void;
}) {
  const [duration, setDuration] = useState("30"),
    [date, setDate] = useState(toBrazil(occurrence?.date || dayKey())),
    [error, setError] = useState("");
  return (
    <Page>
      <Button outline onPress={close}>
        Voltar
      </Button>
      <Title>Registrar atividade</Title>
      <Art index={goal.image} />
      <Title small>{goal.title}</Title>
      <Field
        label="Quantos minutos você realizou?"
        value={duration}
        onChangeText={setDuration}
        keyboardType="number-pad"
      />
      {!occurrence && (
        <Field label="Data (DD/MM/AAAA)" value={date} onChangeText={setDate} />
      )}
      <Txt muted>
        Registre apenas o tempo realizado, mesmo que diferente do planejado.
      </Txt>
      {!!error && <Txt>{error}</Txt>}
      <Button
        onPress={() => {
          const n = Number(duration),
            d = fromBrazil(date);
          if (
            !Number.isInteger(n) ||
            n <= 0 ||
            n > 1440 ||
            !validDay(d) ||
            d > dayKey()
          ) {
            setError("Informe tempo de 1 a 1440 minutos e uma data até hoje.");
            return;
          }
          save(n, d);
          close();
        }}
      >
        Registrar
      </Button>
    </Page>
  );
}
export function Suggestion({
  data,
  goal,
  onSchedule,
}: {
  data: Data;
  goal: Goal;
  onSchedule: (g: Goal, start: string, end: string) => void;
}) {
  const [dismiss, setDismiss] = useState(false);
  const remaining = goal.target - goalProgress(data, goal, dayKey());
  const duration = Math.min(30, remaining),
    slots = freeSlots(data, dayKey(), duration);
  if (
    dismiss ||
    goal.paused ||
    goal.encouragement === "off" ||
    remaining <= 0 ||
    !slots.length
  )
    return null;
  return (
    <Card alternate>
      <View style={styles.row}>
        <Image
          source={fabiSuggestion}
          style={{ width: 90, height: 110, borderRadius: 15 }}
          resizeMode="contain"
        />
        <View style={{ flex: 1 }}>
          <Txt style={{ fontWeight: "700" }}>Uma ideia para hoje</Txt>
          <Txt>
            {goal.encouragement === "firm"
              ? `Faltam ${remaining} minutos para sua meta. `
              : ""}
            Que tal {duration} minutos de {goal.title.toLowerCase()} às{" "}
            {slots[0].start}?
          </Txt>
        </View>
      </View>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Button
            onPress={() => onSchedule(goal, slots[0].start, slots[0].end)}
          >
            Agendar
          </Button>
        </View>
        <View style={{ flex: 1 }}>
          <Button outline onPress={() => setDismiss(true)}>
            Agora não
          </Button>
        </View>
      </View>
    </Card>
  );
}
export function GoalCard({ data, goal, edit, record, find, pause }: any) {
  const t = useTheme(),
    done = goalProgress(data, goal, dayKey()),
    ratio = Math.min(1, done / goal.target);
  return (
    <Card alternate={goal.image === 3}>
      <View style={styles.spread}>
        <View style={styles.row}>
          <Art index={goal.image} size={60} />
          <View>
            <Title small>{goal.title}</Title>
            <Txt muted>
              {goal.period === "daily" ? "Meta diária" : "Meta mensal"}
              {goal.paused ? " · Pausada" : ""}
            </Txt>
          </View>
        </View>
        <Button outline small onPress={edit}>
          Editar
        </Button>
      </View>
      <Title small>
        {done} de {goal.target} minutos
      </Title>
      <View
        accessibilityLabel={`${Math.round(ratio * 100)}% da meta`}
        style={{
          height: 10,
          backgroundColor: "#FFFFFF",
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: 10,
            width: `${ratio * 100}%`,
            backgroundColor: t.primary,
          }}
        />
      </View>
      <Txt muted>{Math.max(0, goal.target - done)} minutos restantes</Txt>
      <Button onPress={record}>Registrar atividade</Button>
      <Button outline onPress={find}>
        Encontrar horário
      </Button>
      <Button small outline onPress={pause}>
        {goal.paused ? "Retomar meta" : "Pausar meta"}
      </Button>
    </Card>
  );
}
