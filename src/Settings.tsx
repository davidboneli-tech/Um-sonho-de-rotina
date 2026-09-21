import React, { useState } from "react";
import { View, Platform } from "react-native";
import { PwaTools } from "./PwaTools";
import { WebPushControls } from "./WebPushControls";
import { Data } from "./domain";
import {
  Settings as Preferences,
  defaultSettings,
  validTime,
  minutes,
} from "./domain";
import {
  Page,
  Title,
  Txt,
  Button,
  Card,
  Choices,
  Field,
  Check,
  Art,
  ThemeContext,
  themes,
  styles,
} from "./ui";
export function SettingsPage({
  settings,
  data,
  restore,
  save,
  alerts,
  enableAlerts,
  refreshAlerts,
  lock,
}: {
  settings: Preferences;
  data: Data;
  restore: (data: Data) => void;
  save: (s: Preferences) => void;
  alerts: string;
  enableAlerts: () => Promise<void>;
  refreshAlerts: () => void;
  lock: () => void;
}) {
  const [draft, set] = useState(settings),
    [error, setError] = useState(""),
    [applied, setApplied] = useState(false);
  const update = (p: Partial<Preferences>) => {
    set({ ...draft, ...p });
    setApplied(false);
  };
  return (
    <ThemeContext.Provider value={draft}>
      <Page>
        <Title>Do seu jeitinho</Title>
        <Txt muted>Escolha, confira e aplique.</Txt>
        <Title small>Temas prontos</Title>
        <Choices
          value={draft.theme}
          onChange={(theme) => update({ theme, color: "" })}
          values={themes.map((t, i) => ({ label: t.name, value: i }))}
        />
        <Title small>Cor principal</Title>
        <Choices
          value={draft.color}
          onChange={(color) => update({ color })}
          values={[
            { label: "Do tema", value: "" },
            ...themes.map((t) => ({
              label: t.name.split(" ")[0],
              value: t.primary,
            })),
          ]}
        />
        <Title small>Fonte dos títulos</Title>
        <Choices
          value={draft.font}
          onChange={(font) => update({ font })}
          values={[
            { label: "Clássica", value: 0 },
            { label: "Arredondada", value: 1 },
            { label: "Simples", value: 2 },
          ]}
        />
        <Title small>Tamanho do texto</Title>
        <Choices
          value={draft.large}
          onChange={(large) => update({ large })}
          values={[
            { label: "Normal", value: false },
            { label: "Maior", value: true },
          ]}
        />
        <Title small>Enfeites</Title>
        <Choices
          value={draft.decoration}
          onChange={(decoration) => update({ decoration })}
          values={[
            { label: "Nenhum", value: 0 },
            { label: "Discreto", value: 1 },
            { label: "Florido", value: 2 },
          ]}
        />
        <Title small>Prévia</Title>
        <Card>
          <View style={styles.row}>
            <Art index={0} />
            <View>
              <Txt>09:00</Txt>
              <Title small>Limpeza da casa</Title>
            </View>
          </View>
        </Card>
        <Button
          outline
          onPress={() =>
            update({
              theme: 0,
              color: "",
              font: 0,
              large: false,
              decoration: 1,
            })
          }
        >
          Restaurar tema original
        </Button>
        <Title small>Horários para sugestões</Title>
        <Txt muted>
          Somente dentro deste período. Compromissos de dia inteiro bloqueiam
          sugestões.
        </Txt>
        <Field
          label="Disponível a partir de (HH:MM)"
          value={draft.availableStart}
          onChangeText={(availableStart: string) => update({ availableStart })}
        />
        <Field
          label="Até (HH:MM)"
          value={draft.availableEnd}
          onChangeText={(availableEnd: string) => update({ availableEnd })}
        />
        {Platform.OS === "ios" && (
          <Check
            label="Permitir Face ID"
            checked={draft.biometric}
            onPress={() => update({ biometric: !draft.biometric })}
          />
        )}
        {!!error && <Txt>{error}</Txt>}
        <Button
          onPress={() => {
            if (
              !validTime(draft.availableStart) ||
              !validTime(draft.availableEnd) ||
              minutes(draft.availableEnd) <= minutes(draft.availableStart)
            ) {
              setError("Confira o início e fim da disponibilidade.");
              return;
            }
            save(draft);
            setError("");
            setApplied(true);
          }}
        >
          Aplicar alterações
        </Button>
        {applied && <Txt>Alterações aplicadas.</Txt>}
        <Title small>Lembretes</Title>
        <Txt>{alerts}</Txt>
        {Platform.OS !== "web" && <Button outline onPress={enableAlerts}>
          Ativar ou renovar notificações
        </Button>}
        {Platform.OS === "web" && <WebPushControls enable={enableAlerts} refresh={refreshAlerts} />}
        {Platform.OS === "web" && <PwaTools data={data} restore={restore} />}
        <Txt muted>
          Sem sons, vibrações programadas ou animações. A imagem da Fabi é
          estática.
        </Txt>
        <Button outline onPress={lock}>
          Bloquear agenda
        </Button>
      </Page>
    </ThemeContext.Provider>
  );
}
