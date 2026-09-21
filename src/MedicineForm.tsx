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
import { Page, Button, Title, Field, Check, Txt, Art, Choices } from "./ui";
import { pickMedicinePhoto } from "./medicinePhoto";
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
  const [photoBusy, setPhotoBusy] = useState(false);
  const [interval, setInterval] = useState(String(m.intervalDays || 15));
  const [frequency, setFrequency] = useState(m.intervalDays ? "interval" : "weekdays");
  async function photo() {
    setError("");
    setPhotoBusy(true);
    try {
      if (Platform.OS === "web") {
        const uri = await pickMedicinePhoto();
        if (uri) set(current => ({ ...current, photo: uri }));
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.5,
        base64: false,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      const destination = `${FileSystem.documentDirectory}medicine-${uid()}.jpg`;
      await FileSystem.copyAsync({ from: asset.uri, to: destination });
      set(current => ({ ...current, photo: destination }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível selecionar a foto.");
    } finally { setPhotoBusy(false); }
  }
  function submit() {
    const list = [...new Set(times.split(",").map((t) => t.trim()))];
    if (
      !m.name.trim() ||
      !m.dose.trim() ||
      list.some((t) => !validTime(t)) ||
      (frequency === "weekdays" && !m.days.length)
    ) {
      setError("Informe nome, dose, horários HH:MM e dias de uso.");
      return;
    }
    const intervalDays = frequency === "interval" ? Number(interval) : undefined;
    if (intervalDays !== undefined && (!Number.isInteger(intervalDays) || intervalDays < 1 || intervalDays > 365)) {
      setError("Informe um intervalo de 1 a 365 dias.");
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
    save({ ...m, name: m.name.trim(), times: list.sort(), startDate, endDate, intervalDays });
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
      <Button outline onPress={photo} disabled={photoBusy}>
        {photoBusy ? "Preparando foto…" : "Escolher foto da embalagem"}
      </Button>
      {!!m.photo && <Button outline disabled={photoBusy} onPress={() => set(current => ({ ...current, photo: undefined }))}>Remover foto</Button>}
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
      <Title small>Frequência de uso</Title>
      <Choices value={frequency} onChange={setFrequency} values={[{ label: "Dias da semana", value: "weekdays" }, { label: "A cada X dias", value: "interval" }]} />
      {frequency === "interval" ? <>
        <Field label="Intervalo em dias" value={interval} onChangeText={setInterval} keyboardType="number-pad" />
        <Txt muted>Exemplo: 15 para usar a cada 15 dias. A data de início é o primeiro dia de uso.</Txt>
      </> : [
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
        Cada horário terá uma confirmação separada. Os lembretes seguem a frequência e as datas cadastradas.
      </Txt>
      {!!error && <Txt style={{ color: "#A02D43" }}>{error}</Txt>}
      <Button onPress={submit} disabled={photoBusy}>Salvar medicamento</Button>
    </Page>
  );
}
