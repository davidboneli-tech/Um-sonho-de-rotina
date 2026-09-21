import React, { useState } from "react";
import { View, Image, Platform } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { configurePin, verifySecret } from "./platform";
import { Button, Field, Txt, Title, Page, Card, Flourish } from "./ui";
import { people } from "./assets";
export function Auth({
  existing,
  biometrics,
  onUnlock,
}: {
  existing: boolean;
  biometrics: boolean;
  onUnlock: () => void;
}) {
  const [setup, setSetup] = useState(!existing),
    [recovery, setRecovery] = useState(false),
    [pin, setPin] = useState(""),
    [confirm, setConfirm] = useState("");
  const [code, setCode] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (setup) {
        if (pin !== confirm) throw new Error("Os PINs precisam ser iguais.");
        setCode(await configurePin(pin));
      } else if (await verifySecret(pin, recovery)) {
        if (recovery) {
          setSetup(true);
          setRecovery(false);
          setPin("");
          setConfirm("");
        } else onUnlock();
      } else
        setError(
          recovery ? "Código de recuperação incorreto." : "PIN incorreto.",
        );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function face() {
    try {
      if (
        !(await LocalAuthentication.hasHardwareAsync()) ||
        !(await LocalAuthentication.isEnrolledAsync())
      )
        throw new Error("Face ID indisponível. Use seu PIN.");
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Abrir sua agenda",
        cancelLabel: "Usar PIN",
        disableDeviceFallback: true,
      });
      if (result.success) onUnlock();
    } catch {
      setError("Não foi possível usar Face ID. Use seu PIN.");
    }
  }
  return (
    <Page>
      <View style={{ alignItems: "center", paddingTop: 20 }}>
        <Title>Um sonho de rotina</Title>
        <Txt muted>Um tempo para você</Txt>
        <Image
          source={people.Fabi}
          resizeMode="cover"
          style={{
            width: 158,
            height: 190,
            borderRadius: 75,
            marginVertical: 25,
          }}
        />
      </View>
      {code ? (
        <Card>
          <Title small>Guarde sua chave</Title>
          <Txt>
            Guarde este código fora do aplicativo. Ele permite criar um novo PIN
            e será substituído se você recuperar o acesso.
          </Txt>
          <Txt
            selectable
            style={{ fontWeight: "700", fontSize: 22, marginVertical: 20 }}
          >
            {code}
          </Txt>
          <Button onPress={onUnlock}>Guardei o código · Abrir agenda</Button>
        </Card>
      ) : (
        <>
          <Title small>
            {setup
              ? "Crie seu PIN"
              : recovery
                ? "Recuperar acesso"
                : "Bem-vinda, Fabi"}
          </Title>
          <Field
            label={recovery ? "Código de recuperação" : "PIN de seis dígitos"}
            value={pin}
            onChangeText={setPin}
            secureTextEntry={!recovery}
            keyboardType={recovery ? "default" : "number-pad"}
            maxLength={recovery ? 40 : 6}
            autoCapitalize="characters"
          />
          {setup && (
            <Field
              label="Repita seu PIN"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              keyboardType="number-pad"
              maxLength={6}
            />
          )}
          <Button disabled={busy} onPress={submit}>
            {busy
              ? "Verificando…"
              : setup
                ? "Criar acesso"
                : recovery
                  ? "Validar código"
                  : "Abrir minha agenda"}
          </Button>
          {!setup && !recovery && biometrics && Platform.OS === "ios" && (
            <Button outline onPress={face}>
              Entrar com Face ID
            </Button>
          )}
          {!setup && (
            <Button
              outline
              onPress={() => {
                setRecovery(!recovery);
                setPin("");
                setError("");
              }}
            >
              {recovery ? "Voltar ao PIN" : "Esqueci meu PIN"}
            </Button>
          )}
        </>
      )}
      {!!error && (
        <Txt
          accessibilityRole="alert"
          style={{ color: "#A02D43", marginVertical: 10 }}
        >
          {error}
        </Txt>
      )}
      {Platform.OS === "web" && (
        <Txt muted style={{ fontSize: 12, marginTop: 16 }}>
          Seus dados ficam neste aparelho. O PIN bloqueia a tela, mas não
          criptografa os registros. Faça backups em Ajustes.
        </Txt>
      )}
      <Flourish />
    </Page>
  );
}
