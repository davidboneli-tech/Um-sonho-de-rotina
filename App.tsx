import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Pressable,
  Modal,
  AppState,
  Platform,
  KeyboardAvoidingView,
  Image,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Segments } from "./src/ui";
import { NavIcon } from "./src/NavIcon";
import { StatusBar } from "expo-status-bar";
import {
  Data,
  Event,
  Goal,
  Medicine,
  Occurrence,
  emptyData,
  dayKey,
  addDays,
  parseDay,
  prettyDay,
  occurrences,
  pending,
  dosesOn,
  newEvent,
  editOccurrence,
  goalProgress,
  freeSlots,
  uid,
  toBrazil,
  defaultSettings,
} from "./src/domain";
import {
  ThemeContext,
  Page,
  Title,
  Txt,
  Button,
  DeleteButton,
  Card,
  Field,
  Check,
  Choices,
  Art,
  Avatar,
  Flourish,
  styles,
  useTheme,
} from "./src/ui";
import {
  hasPin,
  loadData,
  saveData,
  syncAlerts,
  requestAlerts,
} from "./src/platform";
import { Auth } from "./src/Auth";
import { EventForm } from "./src/EventForm";
import { MedicineForm } from "./src/MedicineForm";
import { GoalForm, ActivityForm, GoalCard, Suggestion } from "./src/Goals";
import { goalAmount } from "./src/goalUnits";
import { BackupReminder } from "./src/BackupReminder";
import { FabiMoment, FabiMessage } from "./src/FabiMoment";
import { excludeMedicineDose } from "./src/medicineDeletion";
import { SettingsPage } from "./src/Settings";

import { drafts, loadDraft } from "./src/drafts";
import { FormScreen, isForm } from "./src/draftModel";
import { EventArt } from "./src/EventArt";

type Screen =
  | FormScreen
  | { kind: "detail"; occurrence: Occurrence }
  | { kind: "slots"; goal: Goal }
  | { kind: "history" }
  | { kind: "pending" }
  | null;
type Confirmation = {
  title: string;
  message: string;
  actions: { label: string; run: () => void }[];
} | null;
const tabs = ["Hoje", "Calendário", "Rotinas", "Objetivos", "Ajustes"];
const icons = [
  "home-outline",
  "calendar-outline",
  "list-outline",
  "flag-outline",
  "settings-outline",
] as const;
const modeLabel: Record<string, string> = {
  horario: "",
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
  livre: "Sem horário",
  dia: "Dia inteiro",
};
function EventCard({
  o,
  data,
  open,
  complete,
}: {
  o: Occurrence;
  data: Data;
  open: () => void;
  complete: () => void;
}) {
  const done = !!data.done[o.key],
    skipped = !!data.skipped[o.key];
  return (
    <Card alternate={o.event.image % 2 === 1}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: done }}
          accessibilityLabel={`Concluir ${o.event.title}`}
          onPress={complete}
          style={{ width: 42, minHeight: 48, justifyContent: "center" }}
        >
          <Txt style={{ fontSize: 30, color: "#8A6579" }}>
            {done ? "☑" : skipped ? "−" : "○"}
          </Txt>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Abrir ${o.event.title}`}
          onPress={open}
          style={{ flex: 1 }}
        >
          <Txt muted>
            {o.event.mode === "horario"
              ? `${o.event.start}–${o.event.end}`
              : modeLabel[o.event.mode]}
          </Txt>
          <Txt
            style={{
              fontSize: 19,
              fontWeight: "600",
              textDecorationLine: done ? "line-through" : "none",
            }}
          >
            {o.event.title}
          </Txt>
          <View style={[styles.row, { marginTop: 7 }]}>
            {o.event.people.map((n) => (
              <Avatar key={n} name={n} size={29} />
            ))}
          </View>
          {skipped && <Txt muted>Pulado neste dia</Txt>}
        </Pressable>
        <EventArt event={o.event} size={70} expandable />
      </View>
    </Card>
  );
}
function Application() {
  const [data, setData] = useState<Data>(emptyData()),
    [loaded, setLoaded] = useState(false),
    [fatal, setFatal] = useState(""),
    [existing, setExisting] = useState(false),
    [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState("Hoje"),
    [selected, setSelected] = useState(dayKey()),
    [month, setMonth] = useState(dayKey().slice(0, 7)),
    [view, setView] = useState("Hoje"),
    [routineTab, setRoutineTab] = useState("Tarefas");
  const [screen, setScreenState] = useState<Screen>(null),
    [confirmation, setConfirmation] = useState<Confirmation>(null),
    [message, setMessage] = useState(""),
    [alertStatus, setAlertStatus] = useState(
      Platform.OS === "web" ? "Verificando os lembretes online…" : "Ative os avisos silenciosos em Ajustes.",
    ),
    [goalFilter, setGoalFilter] = useState("Ativos");
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);
  const [celebrationDismissed, setCelebrationDismissed] = useState(false);
  const ref = useRef(data);
  ref.current = data;
  const today = dayKey();
  useEffect(() => {
    Promise.all([loadData(), hasPin(), loadDraft(setMessage)])
      .then(([d, p, draft]) => {
        if (d)
          setData({
            ...d,
            doseHistory: d.doseHistory || {},
            settings: { ...defaultSettings, ...d.settings },
          });
        if (draft) { setScreenState(draft.screen); setTab(draft.tab); setSelected(draft.selected); }
        setExisting(p);
        setLoaded(true);
      })
      .catch((e) => setFatal(e.message));
  }, []);
  useEffect(() => {
    if (!loaded) return;
    saveData(data).catch(() =>
      setMessage(
        "Não foi possível salvar. Mantenha o app aberto e tente novamente.",
      ),
    );
  }, [data, loaded]);
  const refreshAlerts = () =>
    syncAlerts(ref.current)
      .then(setAlertStatus)
      .catch(() =>
        setAlertStatus(
          "Não foi possível atualizar os avisos. Tente novamente em Ajustes.",
        ),
      );
  useEffect(() => {
    if (loaded && unlocked) refreshAlerts();
  }, [data, loaded, unlocked]);
  useEffect(() => {
    if (Platform.OS !== "web" || !loaded) return;
    const reconnect = () => { refreshAlerts(); };
    window.addEventListener("online", reconnect);
    return () => window.removeEventListener("online", reconnect);
  }, [loaded]);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background") {
        setUnlocked(false);
        setConfirmation(null);
      }

    });
    return () => sub.remove();
  }, []);
  const change = (p: Partial<Data>) => setData((d) => ({ ...d, ...p }));
  const close = () => setScreenState(null);
  const finishForm = () => { drafts.clear(); close(); };
  const resumeDraft = () => {
    const d = drafts.current;
    if (d) { setTab(d.tab); setSelected(d.selected); setScreenState(d.screen); }
  };
  const discardDraft = () => ask("Descartar rascunho?", "Somente a edição não salva será descartada. Os cadastros da agenda continuam como estão.", [
    { label: "Descartar rascunho", run: () => { drafts.clear(); close(); } },
  ]);
  function setScreen(next: Screen) {
    if (isForm(next)) {
      const start = () => { drafts.begin(next, tab, selected); setScreenState(next); };
      if (drafts.current) {
        ask("Você tem um rascunho", "Continue a edição anterior ou descarte o rascunho para começar este cadastro.", [
          { label: "Continuar edição", run: resumeDraft },
          { label: "Descartar e começar este", run: start },
        ]);
      } else start();
    } else setScreenState(next);
  }
  const ask = (
    title: string,
    message: string,
    actions: NonNullable<Confirmation>["actions"],
  ) => setConfirmation({ title, message, actions });
  const edit = (o: Occurrence) =>
    setScreen({
      kind: "event",
      event: { ...o.event, date: o.date, checklist: [...o.event.checklist] },
      original: o,
    });
  const complete = (o: Occurrence) => {
    if (data.done[o.key]) {
      ask("Desfazer conclusão?", o.event.title, [
        {
          label: "Desfazer",
          run: () => {
            const done = { ...data.done };
            delete done[o.key];
            change({
              done,
              activities: data.activities.filter(
                (a) => a.occurrenceKey !== o.key,
              ),
            });
          },
        },
      ]);
      return;
    }
    const goal = data.goals.find((g) => g.id === o.event.goalId);
    if (goal) {
      setScreen({ kind: "activity", goal, occurrence: o });
      return;
    }
    const skipped = { ...data.skipped };
    delete skipped[o.key];
    change({
      done: { ...data.done, [o.key]: new Date().toISOString() },
      skipped,
    });
  };
  const remove = (o: Occurrence) =>
    ask(
      "Excluir compromisso?",
      `${o.event.title} · ${toBrazil(o.date)}. A exclusão também cancela os lembretes correspondentes.`,
      o.event.repeat === "none"
        ? [
            {
              label: "Excluir compromisso",
              run: () => {
                change({
                  events: data.events.filter((e) => e.id !== o.event.id),
                });
                close();
              },
            },
          ]
        : [
            {
              label: "Só este dia",
              run: () => {
                change({
                  events: data.events.map((e) =>
                    e.id === o.event.id
                      ? { ...e, exceptions: [...e.exceptions, o.date] }
                      : e,
                  ),
                });
                close();
              },
            },
            {
              label: "Este e os próximos",
              run: () => {
                change({
                  events: data.events.map((e) =>
                    e.id === o.event.id
                      ? { ...e, endDate: addDays(o.date, -1) }
                      : e,
                  ),
                });
                close();
              },
            },
          ],
    );
  const schedule = (g: Goal, start: string, end: string) =>
    setScreen({
      kind: "event",
      event: {
        ...newEvent(today),
        title: g.title,
        start,
        end,
        image: g.image,
        goalId: g.id,
        highlight: false,
      },
    });
  const renderEvents = (date: string, highlight = false) => {
    const list = occurrences(data, date).filter(
      (o) => !highlight || o.event.highlight,
    );
    return list.length ? (
      list.map((o) => (
        <EventCard
          key={o.key}
          o={o}
          data={data}
          open={() => setScreen({ kind: "detail", occurrence: o })}
          complete={() => complete(o)}
        />
      ))
    ) : (
      <Card>
        <Txt muted>
          {highlight
            ? "Nenhum destaque nesta data."
            : "Seu dia tem espaço para novos planos."}
        </Txt>
      </Card>
    );
  };
  const removeMedicine = (medicine: Medicine) => ask(
    "Excluir medicamento?",
    `${medicine.name}: o cadastro e os lembretes futuros serão removidos. As doses já confirmadas permanecem no histórico.`,
    [{ label: "Excluir medicamento", run: () => {
      change({ medicines: data.medicines.filter(m => m.id !== medicine.id) });
      finishForm();
    } }],
  );
  const removeDose = (medicine: Medicine, date: string, time: string) => ask(
    "Excluir lançamento?",
    `${medicine.name} · ${toBrazil(date)} às ${time}. Escolha o que remover da agenda e dos lembretes. As confirmações anteriores serão preservadas.`,
    [
      { label: "Só este horário neste dia", run: () => change({ medicines: data.medicines.map(m => m.id === medicine.id ? excludeMedicineDose(m, date, time, "one") : m) }) },
      { label: "Este e os próximos", run: () => change({ medicines: data.medicines.map(m => m.id === medicine.id ? excludeMedicineDose(m, date, time, "future") : m) }) },
    ],
  );
  const doseCards = (date: string) =>
    dosesOn(data, date).map((d) => {
      const taken = data.doses[d.key];
      return (
        <Card key={d.key} alternate={!!taken}>
          <View style={styles.row}>
            {d.medicine.photo ? (
              <Image
                source={{ uri: d.medicine.photo }}
                style={{ width: 65, height: 65, borderRadius: 10 }}
              />
            ) : (
              <Art index={18} size={65} />
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Editar ${d.medicine.name}`}
              onPress={() =>
                setScreen({ kind: "medicine", medicine: d.medicine })
              }
              style={{ flex: 1 }}
            >
              <Txt style={{ fontWeight: "700" }}>{d.medicine.name}</Txt>
              <Txt>
                {d.time} · {d.medicine.dose}
              </Txt>
              <Txt muted>
                {taken
                  ? `Tomado às ${new Date(taken).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
                  : "Sem confirmação"}
              </Txt>
            </Pressable>
          </View>
          <Button
            outline={!!taken}
            onPress={() =>
              ask(
                taken ? "Desfazer confirmação?" : "Confirmar dose tomada?",
                `${d.medicine.name} · ${d.medicine.dose} · previsto para ${d.time}`,
                [
                  {
                    label: taken ? "Desfazer" : "Sim, tomei",
                    run: () => {
                      const doses = { ...data.doses };
                      const doseHistory = { ...data.doseHistory };
                      if (taken) {
                        delete doses[d.key];
                        delete doseHistory[d.key];
                      } else {
                        doses[d.key] = new Date().toISOString();
                        doseHistory[d.key] = {
                          name: d.medicine.name,
                          dose: d.medicine.dose,
                          date,
                          time: d.time,
                          confirmedAt: doses[d.key],
                        };
                      }
                      change({ doses, doseHistory });
                    },
                  },
                ],
              )
            }
          >
            {taken ? "Desfazer" : "Tomei"}
          </Button>
          {!taken && <DeleteButton onPress={() => removeDose(d.medicine, date, d.time)} />}
        </Card>
      );
    });
  function Calendar() {
    const first = parseDay(`${month}-01`),
      offset = (first.getDay() + 6) % 7,
      count = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const shift = (n: number) => {
      const date = new Date(first);
      date.setMonth(date.getMonth() + n);
      setMonth(dayKey(date).slice(0, 7));
    };
    return (
      <>
        <View style={styles.spread}>
          <Button small outline onPress={() => shift(-1)}>
            ‹
          </Button>
          <Title small>
            {first.toLocaleDateString("pt-BR", {
              month: "long",
              year: "numeric",
            })}
          </Title>
          <Button small outline onPress={() => shift(1)}>
            ›
          </Button>
        </View>
        <Button
          small
          outline
          onPress={() => {
            setMonth(today.slice(0, 7));
            setSelected(today);
          }}
        >
          Hoje
        </Button>
        <View style={{ flexDirection: "row" }}>
          {["S", "T", "Q", "Q", "S", "S", "D"].map((d, i) => (
            <View
              key={i}
              style={{ width: "14.285%", alignItems: "center", padding: 8 }}
            >
              <Txt style={{ fontWeight: "700" }}>{d}</Txt>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {Array.from(
            { length: Math.ceil((offset + count) / 7) * 7 },
            (_, i) => {
              const n = i - offset + 1,
                date = `${month}-${String(n).padStart(2, "0")}`;
              if (n < 1 || n > count)
                return (
                  <View key={i} style={{ width: "14.285%", height: 80 }} />
                );
              const items = occurrences(data, date).filter(
                (o) => o.event.highlight,
              );
              return (
                <Pressable
                  key={i}
                  accessibilityRole="button"
                  accessibilityLabel={`Dia ${n}`}
                  onPress={() => setSelected(date)}
                  style={{
                    width: "14.285%",
                    minHeight: 80,
                    borderWidth: 0.5,
                    borderColor: "#E3D7DD",
                    padding: 3,
                    backgroundColor:
                      date === selected ? "#F1D8E0" : "transparent",
                    borderRadius: 8,
                  }}
                >
                  <Txt
                    style={{
                      textAlign: "center",
                      fontWeight: date === selected ? "700" : "400",
                    }}
                  >
                    {n}
                  </Txt>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      justifyContent: "center",
                    }}
                  >
                    {items.slice(0, 3).map((o) => (
                      <EventArt key={o.key} event={o.event} size={21} />
                    ))}
                    {items.length > 3 && (
                      <Txt style={{ fontSize: 10 }}>+{items.length - 3}</Txt>
                    )}
                  </View>
                </Pressable>
              );
            },
          )}
        </View>
        <Txt muted style={{ fontSize: 13, marginVertical: 12 }}>
          Somente os destaques aparecem no mês.
        </Txt>
        <Title small>{prettyDay(selected)}</Title>
        {renderEvents(selected, true)}
        <Button
          outline
          onPress={() => {
            setTab("Hoje");
            setView("Hoje");
          }}
        >
          Ver dia completo
        </Button>
      </>
    );
  }
  const nextGoal = data.goals.find(
    (g) =>
      !g.paused &&
      g.encouragement !== "off" &&
      goalProgress(data, g, today) < g.target,
  );
  const overdue = pending(data, today);
  function content() {
    if (tab === "Ajustes")
      return (
        <SettingsPage
          data={data}
          restore={(next) => ask("Restaurar backup?", "Os dados atuais serão substituídos. O PIN deste aparelho será mantido.", [{label: "Substituir e restaurar", run: () => {
            saveData(next).then(() => { drafts.clear(); setScreenState(null); setData(next); setTab("Hoje"); setMessage("Backup restaurado."); }).catch(() => setMessage("Não foi possível restaurar. Os dados atuais foram mantidos."));
          }}])}
          settings={data.settings}
          save={(settings) => change({ settings })}
          alerts={alertStatus}
          refreshAlerts={refreshAlerts}
          enableAlerts={async () => {
            try {
              if (await requestAlerts()) refreshAlerts();
              else
                setAlertStatus(
                  "Permissão não concedida. Confira os ajustes de notificações do iPhone.",
                );
            } catch (e) {
              setMessage((e as Error).message);
            }
          }}
          lock={() => setUnlocked(false)}
        />
      );
    return (
      <Page>
        <View style={styles.spread}>
          <View style={{ flex: 1 }}>
            <Txt style={{ fontStyle: "italic", color: "#AA506B" }}>
              Um sonho de rotina
            </Txt>
            <Title>
              {tab === "Hoje"
                ? "Bom dia, Fabi!"
                : tab === "Objetivos"
                  ? "Meus objetivos"
                  : tab}
            </Title>
          </View>
          {tab === "Hoje" ? <Avatar name="Fabi" size={78} /> : <Flourish />}
        </View>
        {!!drafts.current && <Card>
          <Title small>Você tem uma edição em andamento</Title>
          <Button onPress={resumeDraft}>Continuar edição</Button>
          <Button outline onPress={discardDraft}>Descartar rascunho</Button>
        </Card>}
        {tab === "Hoje" && (
          <>
            <Txt muted>{prettyDay(selected)}</Txt>
            <Segments value={view} onChange={setView} values={["Hoje", "Semana", "Agenda"]} />
            <View style={styles.spread}>
              <Button
                outline
                small
                onPress={() => setSelected(addDays(selected, -1))}
              >
                ‹ Dia anterior
              </Button>
              <Button outline small onPress={() => setSelected(today)}>
                Hoje
              </Button>
              <Button
                outline
                small
                onPress={() => setSelected(addDays(selected, 1))}
              >
                Próximo ›
              </Button>
            </View>
            {view === "Hoje" ? (
              <>
                {selected === today && Platform.OS === "web" && <BackupReminder data={data} />}
                {selected === today && <FabiMoment data={data} celebrationDismissed={celebrationDismissed} onCelebrate={() => {
                  setCelebrationDismissed(true);
                  setGoalFilter("Concluídos");
                  setTab("Objetivos");
                }} />}
                {renderEvents(selected)}
                {dosesOn(data, selected).length > 0 && (
                  <>
                    <Title small>Medicamentos</Title>
                    {doseCards(selected)}
                  </>
                )}
              </>
            ) : (
              Array.from({ length: view === "Semana" ? 7 : 30 }, (_, i) =>
                addDays(selected, i),
              ).map((date) => (
                <View key={date}>
                  <Title small>{prettyDay(date)}</Title>
                  {renderEvents(date)}
                </View>
              ))
            )}
            <Button
              onPress={() =>
                setScreen({ kind: "event", event: newEvent(selected) })
              }
            >
              + Novo compromisso
            </Button>
            {selected === today && nextGoal && !suggestionDismissed && (
              <Suggestion data={data} goal={nextGoal} onSchedule={schedule} onDismiss={() => setSuggestionDismissed(true)} />
            )}
            {overdue.length > 0 && <Pressable accessibilityRole="button" accessibilityLabel="Ver compromissos pendentes" onPress={() => setScreen({ kind: "pending" })}>
              <Card alternate><FabiMessage scene="attention" title="Fabi, ficou algo pendente. Vamos conferir?" body={`${overdue.length} ${overdue.length === 1 ? "compromisso para conferir" : "compromissos para conferir"}. Toque para ver.`} /></Card>
            </Pressable>}
          </>
        )}
        {tab === "Calendário" && (
          <>
            <Calendar />
            <Button
              onPress={() =>
                setScreen({
                  kind: "event",
                  event: { ...newEvent(selected), highlight: true },
                })
              }
            >
              + Novo destaque
            </Button>
          </>
        )}
        {tab === "Rotinas" && (
          <>
            <Choices
              value={routineTab}
              onChange={setRoutineTab}
              values={["Tarefas", "Medicamentos"].map((value) => ({
                label: value,
                value,
              }))}
            />
            {routineTab === "Tarefas" ? (
              <>
                <Button
                  onPress={() =>
                    setScreen({
                      kind: "event",
                      event: {
                        ...newEvent(today),
                        repeat: "weekly",
                        mode: "manha",
                        reminders: [],
                      },
                    })
                  }
                >
                  + Nova rotina
                </Button>
                {data.events
                  .filter(
                    (e) =>
                      e.repeat !== "none" && (!e.endDate || e.endDate >= today),
                  )
                  .map((e) => (
                    <Card key={e.id}>
                      <View style={styles.row}>
                        <EventArt event={e} expandable />
                        <View style={{ flex: 1 }}>
                          <Title small>{e.title}</Title>
                          <Txt muted>
                            {e.repeat === "weekly"
                              ? e.days
                                  .map(
                                    (n) =>
                                      [
                                        "Dom",
                                        "Seg",
                                        "Ter",
                                        "Qua",
                                        "Qui",
                                        "Sex",
                                        "Sáb",
                                      ][n],
                                  )
                                  .join(" · ")
                              : e.repeat === "monthly"
                                ? "Mensal"
                                : "Anual"}
                          </Txt>
                          <Txt>
                            {e.mode === "horario"
                              ? `${e.start}–${e.end}`
                              : modeLabel[e.mode]}
                          </Txt>
                        </View>
                      </View>
                      <Button
                        outline
                        onPress={() => {
                          let date = today;
                          while (
                            !occurrences(data, date).some(
                              (o) => o.event.id === e.id,
                            ) &&
                            date < addDays(today, 366)
                          )
                            date = addDays(date, 1);
                          edit({ event: e, date, key: `${e.id}@${date}` });
                        }}
                      >
                        Editar rotina
                      </Button>
                      <DeleteButton onPress={() => {
                        const next = Array.from({ length: 367 }, (_, i) => addDays(today, i)).flatMap(date => occurrences(data, date)).find(o => o.event.id === e.id);
                        if (next) remove(next);
                        else ask("Excluir rotina?", `${e.title}: remover o cadastro desta rotina?`, [{ label: "Excluir rotina", run: () => change({ events: data.events.filter(x => x.id !== e.id) }) }]);
                      }}>Excluir rotina</DeleteButton>
                    </Card>
                  ))}
                {!data.events.some((e) => e.repeat !== "none") && (
                  <Card>
                    <Txt muted>
                      Cadastre uma atividade que se repete durante a semana.
                    </Txt>
                  </Card>
                )}
                <Title small>Acontece hoje</Title>
                {occurrences(data, today)
                  .filter((o) => o.event.repeat !== "none")
                  .map((o) => (
                    <Card key={o.key}>
                      <Txt>{o.event.title}</Txt>
                      <Button outline onPress={() => complete(o)}>
                        {data.done[o.key]
                          ? "Desfazer conclusão"
                          : "Concluir hoje"}
                      </Button>
                      <Button
                        outline
                        onPress={() => {
                          const skipped = { ...data.skipped };
                          if (skipped[o.key]) delete skipped[o.key];
                          else skipped[o.key] = true;
                          change({ skipped });
                        }}
                      >
                        {data.skipped[o.key] ? "Retomar hoje" : "Pular hoje"}
                      </Button>
                    </Card>
                  ))}
              </>
            ) : (
              <>
                <Button onPress={() => setScreen({ kind: "medicine" })}>
                  + Cadastrar medicamento
                </Button>
                <Title small>{prettyDay(today)}</Title>
                {doseCards(today)}
                {!dosesOn(data, today).length && (
                  <Card>
                    <Txt muted>Nenhum medicamento previsto para hoje.</Txt>
                  </Card>
                )}
                <Button outline onPress={() => setScreen({ kind: "history" })}>
                  Ver histórico
                </Button>
                <Title small>Cadastros</Title>
                {data.medicines.map((m) => (
                  <Card key={m.id}>
                    <Txt>
                      {m.name} · {m.active ? "Ativo" : "Pausado"}
                    </Txt>
                    <Txt muted>{m.intervalDays ? `A cada ${m.intervalDays} dias · início ${toBrazil(m.startDate)}` : m.days.length === 7 ? "Todos os dias" : m.days.map(d => ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][d]).join(" · ")} · {m.times.join(", ")}</Txt>
                    <Button
                      outline
                      onPress={() =>
                        setScreen({ kind: "medicine", medicine: m })
                      }
                    >
                      Editar cadastro
                    </Button>
                  </Card>
                ))}
                <Txt muted>{alertStatus}</Txt>
              </>
            )}
          </>
        )}
        {tab === "Objetivos" && (
          <>
            <Txt muted>Um passo de cada vez</Txt>
            <Button onPress={() => setScreen({ kind: "goal" })}>
              + Nova meta
            </Button>
            <Choices
              value={goalFilter}
              onChange={setGoalFilter}
              values={["Ativos", "Concluídos", "Pausados"].map((value) => ({
                label: value,
                value,
              }))}
            />
            {data.goals
              .filter((g) =>
                goalFilter === "Pausados"
                  ? g.paused
                  : !g.paused &&
                    (goalFilter === "Concluídos"
                      ? goalProgress(data, g, today) >= g.target
                      : goalProgress(data, g, today) < g.target),
              )
              .map((g) => (
                <GoalCard
                  key={g.id}
                  data={data}
                  goal={g}
                  edit={() => setScreen({ kind: "goal", goal: g })}
                  record={() => setScreen({ kind: "activity", goal: g })}
                  find={() => setScreen({ kind: "slots", goal: g })}
                  pause={() =>
                    change({
                      goals: data.goals.map((x) =>
                        x.id === g.id ? { ...x, paused: !x.paused } : x,
                      ),
                    })
                  }
                />
              ))}
            {!data.goals.length && (
              <Card>
                <Txt muted>
                  O que você gostaria de reservar para você? Comece com um
                  objetivo.
                </Txt>
              </Card>
            )}
            {nextGoal && !suggestionDismissed && (
              <Suggestion data={data} goal={nextGoal} onSchedule={schedule} onDismiss={() => setSuggestionDismissed(true)} />
            )}
            <Title small>Atividades registradas</Title>
            {data.activities
              .slice()
              .reverse()
              .slice(0, 30)
              .map((a) => (
                <Card key={a.id}>
                  <Txt>
                    {data.goals.find((g) => g.id === a.goalId)?.title} ·{" "}
                    {goalAmount(a.minutes, data.goals.find((g) => g.id === a.goalId)?.period || "daily")} · {toBrazil(a.date)}
                  </Txt>
                  <Button
                    small
                    outline
                    onPress={() =>
                      ask(
                        "Excluir registro?",
                        "O progresso será recalculado.",
                        [
                          {
                            label: "Excluir registro",
                            run: () => {
                              const done = { ...data.done };
                              if (a.occurrenceKey) delete done[a.occurrenceKey];
                              change({
                                activities: data.activities.filter(
                                  (x) => x.id !== a.id,
                                ),
                                done,
                              });
                            },
                          },
                        ],
                      )
                    }
                  >
                    Corrigir registro
                  </Button>
                </Card>
              ))}
          </>
        )}
      </Page>
    );
  }
  function screenContent() {
    if (!screen) return null;
    if (screen.kind === "event")
      return (
        <EventForm
          key={drafts.generation}
          initial={screen.event}
          original={screen.original}
          reschedule={screen.reschedule}
          data={data}
          commit={(events) => change({ events })}
          close={finishForm}
          cancel={close}
        />
      );
    if (screen.kind === "medicine")
      return (
        <MedicineForm
          key={drafts.generation}
          value={screen.medicine}
          remove={screen.medicine ? () => removeMedicine(screen.medicine!) : undefined}
          save={(m) =>
            change({
              medicines: [...data.medicines.filter((x) => x.id !== m.id), m],
            })
          }
          close={finishForm}
          cancel={close}
        />
      );
    if (screen.kind === "goal")
      return (
        <GoalForm
          key={drafts.generation}
          value={screen.goal}
          save={(g) =>
            change({ goals: [...data.goals.filter((x) => x.id !== g.id), g] })
          }
          close={finishForm}
          cancel={close}
        />
      );
    if (screen.kind === "activity")
      return (
        <ActivityForm
          key={drafts.generation}
          goal={screen.goal}
          occurrence={screen.occurrence}
          close={finishForm}
          cancel={close}
          save={(n, date) => {
            const key = screen.occurrence?.key;
            const skipped = { ...data.skipped };
            if (key) delete skipped[key];
            change({
              activities: [
                ...data.activities.filter(
                  (a) => !key || a.occurrenceKey !== key,
                ),
                {
                  id: uid(),
                  goalId: screen.goal.id,
                  date,
                  minutes: n,
                  occurrenceKey: key,
                },
              ],
              done: key
                ? { ...data.done, [key]: new Date().toISOString() }
                : data.done,
              skipped,
            });
          }}
        />
      );
    if (screen.kind === "slots") {
      const duration = Math.min(
          30,
          Math.max(
            1,
            screen.goal.target - goalProgress(data, screen.goal, today),
          ),
        ),
        slots = freeSlots(data, today, duration);
      return (
        <Page>
          <Button outline onPress={close}>
            Voltar
          </Button>
          <Title>Encontrar horário</Title>
          <Txt>
            {duration} minutos para {screen.goal.title.toLowerCase()}
          </Txt>
          {slots.map((s) => (
            <Card key={s.start}>
              <Title small>
                Hoje · {s.start}–{s.end}
              </Title>
              <Button onPress={() => schedule(screen.goal, s.start, s.end)}>
                Escolher e conferir
              </Button>
            </Card>
          ))}
          {!slots.length && (
            <Card>
              <Txt>
                Não há espaço hoje no período permitido. Você pode ajustar a
                disponibilidade em Ajustes ou escolher outra data.
              </Txt>
              <Button
                onPress={() =>
                  setScreen({
                    kind: "event",
                    event: {
                      ...newEvent(addDays(today, 1)),
                      title: screen.goal.title,
                      image: screen.goal.image,
                      goalId: screen.goal.id,
                    },
                  })
                }
              >
                Escolher outro dia
              </Button>
            </Card>
          )}
        </Page>
      );
    }
    if (screen.kind === "pending") return <Page>
      <Button outline onPress={close}>Voltar</Button>
      <Title>Pendentes</Title>
      <Txt muted>Confira o que ficou de outros dias. As próximas repetições continuam na agenda.</Txt>
      {!overdue.length && <Txt>Tudo conferido por aqui!</Txt>}
      {overdue.map(o => <Card key={o.key}>
        <View style={styles.row}>
          <EventArt event={o.event} size={65} expandable />
          <View style={{ flex: 1, minWidth: 0 }}><Title small>{o.event.title}</Title><Txt muted>{toBrazil(o.date)}{o.event.mode === "horario" ? ` · ${o.event.start}` : ""}</Txt></View>
        </View>
        <Button onPress={() => complete(o)}>Concluir</Button>
        <Button outline onPress={() => setScreen({ kind: "event", event: { ...o.event, date: today }, original: o, reschedule: true })}>Reagendar</Button>
        <Button outline onPress={() => ask("Pular esta pendência?", `${o.event.title} · ${toBrazil(o.date)}. As próximas repetições serão mantidas.`, [{ label: "Pular só este dia", run: () => change({ skipped: { ...data.skipped, [o.key]: true } }) }])}>Pular</Button>
      </Card>)}
    </Page>;
    if (screen.kind === "history")
      return (
        <Page>
          <Button outline onPress={close}>
            Voltar
          </Button>
          <Title>Histórico de medicamentos</Title>
          <Txt muted>
            Últimos 30 dias · Sem registro não significa que a dose não foi
            tomada.
          </Txt>
          <Title small>Confirmações preservadas</Title>
          {Object.entries(data.doseHistory)
            .sort((a, b) => b[1].confirmedAt.localeCompare(a[1].confirmedAt))
            .map(([key, r]) => (
              <Card key={key}>
                <Txt>
                  {r.name} · {r.dose}
                </Txt>
                <Txt>
                  {toBrazil(r.date)} · previsto para {r.time}
                </Txt>
                <Txt muted>
                  Confirmado em{" "}
                  {new Date(r.confirmedAt).toLocaleString("pt-BR")}
                </Txt>
                <Button
                  small
                  outline
                  onPress={() =>
                    ask("Desfazer registro?", r.name, [
                      {
                        label: "Desfazer",
                        run: () => {
                          const doses = { ...data.doses },
                            doseHistory = { ...data.doseHistory };
                          delete doses[key];
                          delete doseHistory[key];
                          change({ doses, doseHistory });
                        },
                      },
                    ])
                  }
                >
                  Desfazer confirmação
                </Button>
              </Card>
            ))}
          <Title small>Programação dos últimos dias</Title>
          {Array.from({ length: 30 }, (_, i) => addDays(today, -i)).map(
            (date) => (
              <View key={date}>
                {dosesOn(data, date).length > 0 && (
                  <>
                    <Title small>{toBrazil(date)}</Title>
                    {doseCards(date)}
                  </>
                )}
              </View>
            ),
          )}
        </Page>
      );
    const o = screen.occurrence;
    return (
      <Page>
        <Button outline onPress={close}>
          Voltar
        </Button>
        <View style={styles.spread}>
          <View style={{ flex: 1 }}>
            <Title>{o.event.title}</Title>
            <Txt>{prettyDay(o.date)}</Txt>
            <Txt>
              {o.event.mode === "horario"
                ? `${o.event.start}–${o.event.end}`
                : modeLabel[o.event.mode]}
            </Txt>
          </View>
          <EventArt event={o.event} size={105} expandable />
        </View>
        <View style={styles.row}>
          {o.event.people.map((n) => (
            <Avatar key={n} name={n} size={38} />
          ))}
        </View>
        <Card>
          <Title small>Anotações</Title>
          <Txt>{o.event.notes || "Nenhuma anotação ainda."}</Txt>
        </Card>
        <Card alternate>
          <Title small>Para levar e fazer</Title>
          {o.event.checklist.filter(Boolean).map((item, i) => (
            <Check
              key={i}
              checked={!!data.checks[`${o.key}:${i}`]}
              label={item}
              onPress={() =>
                change({
                  checks: {
                    ...data.checks,
                    [`${o.key}:${i}`]: !data.checks[`${o.key}:${i}`],
                  },
                })
              }
            />
          ))}
          {!o.event.checklist.filter(Boolean).length && (
            <Txt muted>Adicione itens ao editar este evento.</Txt>
          )}
        </Card>
        <Card>
          <Title small>Local</Title>
          <Txt>{o.event.place || "Não informado"}</Txt>
        </Card>
        <Card alternate>
          <Title small>Lembretes</Title>
          <Txt>
            {o.event.reminders.length
              ? o.event.reminders
                  .map((n) => (n === 0 ? "No horário" : `${n} min antes`))
                  .join(" · ")
              : "Sem lembrete"}
          </Txt>
        </Card>
        <Button onPress={() => edit(o)}>Editar evento</Button>
        <Button outline onPress={() => complete(o)}>
          {data.done[o.key] ? "Desfazer conclusão" : "Marcar como concluído"}
        </Button>
        {o.event.repeat !== "none" && (
          <Button
            outline
            onPress={() => {
              change({ skipped: { ...data.skipped, [o.key]: true } });
              close();
            }}
          >
            Pular só este dia
          </Button>
        )}
        <DeleteButton onPress={() => remove(o)}>Excluir compromisso</DeleteButton>
      </Page>
    );
  }
  return (
    <ThemeContext.Provider value={data.settings}>
      <Shell tab={tab} setTab={setTab} unlocked={unlocked}>
        {fatal ? (
          <Page>
            <Title>Não foi possível abrir</Title>
            <Txt>{fatal}</Txt>
          </Page>
        ) : !loaded ? (
          <Page>
            <Txt>Preparando sua agenda…</Txt>
          </Page>
        ) : !unlocked ? (
          <Auth
            existing={existing}
            biometrics={data.settings.biometric}
            onUnlock={() => {
              setExisting(true);
              setUnlocked(true);
              if (!drafts.current) setSelected(dayKey());
            }}
          />
        ) : (
          content()
        )}
        <Modal
          visible={!!screen && unlocked}
          animationType="none"
          onRequestClose={close}
        >
          <ThemeContext.Provider value={data.settings}>
            <SafeAreaView style={{ flex: 1, backgroundColor: "#FCF8F2" }}>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
              >
                {screenContent()}
                {screen && isForm(screen) && <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
                  <Button outline small onPress={discardDraft}>Descartar rascunho</Button>
                </View>}
              </KeyboardAvoidingView>
            </SafeAreaView>
          </ThemeContext.Provider>
        </Modal>
        <Modal
          visible={unlocked && (!!confirmation || !!message)}
          transparent
          animationType="none"
          onRequestClose={() => {
            setConfirmation(null);
            setMessage("");
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "#20101B88",
              justifyContent: "center",
              padding: 25,
            }}
          >
            <View
              style={{
                backgroundColor: "#FCF8F2",
                padding: 22,
                borderRadius: 25,
                maxWidth: 500,
                width: "100%",
                alignSelf: "center",
              }}
            >
              <Title small>{confirmation?.title || "Sua agenda"}</Title>
              <Txt>{confirmation?.message || message}</Txt>
              {confirmation?.actions.map((a, i) => (
                <Button
                  key={i}
                  onPress={() => {
                    setConfirmation(null);
                    a.run();
                  }}
                >
                  {a.label}
                </Button>
              ))}
              <Button
                outline
                onPress={() => {
                  setConfirmation(null);
                  setMessage("");
                }}
              >
                {confirmation ? "Cancelar" : "Entendi"}
              </Button>
            </View>
          </View>
        </Modal>
      </Shell>
    </ThemeContext.Provider>
  );
}
function Shell({ children, tab, setTab, unlocked }: any) {
  const t = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar style="dark" />
      <View
        style={{
          flex: 1,
          width: "100%",
          maxWidth: 620,
          alignSelf: "center",
          backgroundColor: t.bg,
        }}
      >
        {children}
      </View>
      {unlocked && (
        <View
          style={{
            backgroundColor: t.bg,
            borderTopWidth: 1,
            borderColor: "#E3D7DD",
            flexDirection: "row",
            justifyContent: "space-around",
            paddingVertical: 9,
            maxWidth: 620,
            width: "100%",
            alignSelf: "center",
          }}
        >
          {tabs.map((name, i) => (
            <Pressable
              key={name}
              accessibilityRole="tab"
              accessibilityLabel={name}
              accessibilityState={{ selected: tab === name }}
              onPress={() => setTab(name)}
              style={{
                alignItems: "center",
                minWidth: 55,
                minHeight: 48,
                justifyContent: "center",
              }}
            >
              <NavIcon
                name={icons[i]}
                size={24}
                color={tab === name ? t.primary : "#756C76"}
              />
              <Txt
                style={{
                  fontSize: 11,
                  color: tab === name ? t.primary : "#756C76",
                }}
              >
                {name}
              </Txt>
            </Pressable>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}
export default function App() {
  return (
    <SafeAreaProvider>
      <Application />
    </SafeAreaProvider>
  );
}

