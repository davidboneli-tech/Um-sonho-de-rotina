import React, { useState } from "react";
import { Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";
import {
  Medicine,
  uid,
  dayKey,
  validTime,
  validDay,
  fromBrazil,
  toBrazil,
} from "./domain";
import { Page, Button, Title, Field, Check, Txt, Art } from "./ui";
export function MedicineForm({
  value,
  save,
  close,
}: {
  value?: Medicine;
  save: (m: Medicine) => void;
  close: () => void;
}) {
  const [m, set] = useState<Medicine>(
    value || {
      id: uid(),
      name: "",
      dose: "",
      times: ["08:00"],
      days: [0, 1, 2, 3, 4, 5, 6],
      startDate: dayKey(),
      active: true,
    },
  );
  const [times, setTimes] = useState(m.times.join(", ")),
    [start, setStart] = useState(toBrazil(m.startDate)),
    [end, setEnd] = useState(m.endDate ? toBrazil(m.endDate) : ""),
    [error, setError] = useState("");
  async function photo() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.5,
        base64: Platform.OS === "web",
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (Platform.OS === "web")
        set({
          ...m,
          photo: `data:${asset.mimeType || "image/jpeg"};base64,${asset.base64}`,
        });
      else {
        const destination = `${FileSystem.documentDirectory}medicine-${uid()}.jpg`;
        await FileSystem.copyAsync({ from: asset.uri, to: destination });
        set({ ...m, photo: destination });
      }
    } catch {
      setError("Não foi possível selecionar a foto.");
    }
  }
  function submit() {
    const list = [...new Set(times.split(",").map((t) => t.trim()))];
    if (
      !m.name.trim() ||
      !m.dose.trim() ||
      list.some((t) => !validTime(t)) ||
      !m.days.length
    ) {
      setError("Informe nome, dose, horários HH:MM e dias de uso.");
      return;
    }
    const startDate = fromBrazil(start),
      endDate = end ? fromBrazil(end) : undefined;
    if (
      !validDay(startDate) ||
      (endDate && (!validDay(endDate) || endDate < startDate))
    ) {
      setError("Confira as datas de início e término.");
      return;
    }
    save({ ...m, name: m.name.trim(), times: list.sort(), startDate, endDate });
    close();
  }
  return (
    <Page>
      <Button outline onPress={close}>
        Cancelar
      </Button>
      <Title>{value ? "Editar medicamento" : "Novo medicamento"}</Title>
      {m.photo ? (
        <Image
          source={{ uri: m.photo }}
          style={{ width: 100, height: 100, borderRadius: 15 }}
        />
      ) : (
        <Art index={18} />
      )}
      <Button outline onPress={photo}>
        Escolher foto da embalagem
      </Button>
      <Field
        label="Nome do medicamento"
        value={m.name}
        onChangeText={(name: string) => set({ ...m, name })}
      />
      <Field
        label="Dose conforme sua orientação"
        value={m.dose}
        onChangeText={(dose: string) => set({ ...m, dose })}
      />
      <Field
        label="Horários (HH:MM, separados por vírgula)"
        value={times}
        onChangeText={setTimes}
      />
      {[
        "Domingo",
        "Segunda",
        "Terça",
        "Quarta",
        "Quinta",
        "Sexta",
        "Sábado",
      ].map((d, i) => (
        <Check
          key={d}
          label={d}
          checked={m.days.includes(i)}
          onPress={() =>
            set({
              ...m,
              days: m.days.includes(i)
                ? m.days.filter((n) => n !== i)
                : [...m.days, i],
            })
          }
        />
      ))}
      <Field
        label="Início (DD/MM/AAAA)"
        value={start}
        onChangeText={setStart}
      />
      <Field
        label="Término opcional (DD/MM/AAAA)"
        value={end}
        onChangeText={setEnd}
      />
      <Check
        label="Medicamento ativo"
        checked={m.active}
        onPress={() => set({ ...m, active: !m.active })}
      />
      <Txt muted>
        Cada horário terá uma confirmação separada. O aviso será silencioso.
      </Txt>
      {!!error && <Txt style={{ color: "#A02D43" }}>{error}</Txt>}
      <Button onPress={submit}>Salvar medicamento</Button>
    </Page>
  );
}
