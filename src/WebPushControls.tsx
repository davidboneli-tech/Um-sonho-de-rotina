import React, { useState } from "react";
import { Button, Field, Txt } from "./ui";
import { disableWebPush, pairWebPush, testWebPush, webPushConfigured, webPushPaired } from "./webPush";

export function WebPushControls({ enable, refresh }: { enable: () => Promise<void>; refresh: () => void }) {
  const [code, setCode] = useState("");
  const [paired, setPaired] = useState(webPushPaired);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function run(fn: () => Promise<void>) {
    if (busy) return;
    setBusy(true); setMessage("");
    try { await fn(); } catch (e) { setMessage((e as Error).message); } finally { setBusy(false); }
  }
  if (!webPushConfigured()) return <Txt muted>Assim que o serviço estiver conectado, você poderá ativar e testar os avisos aqui.</Txt>;
  return <>
    {!paired && <>
      <Txt>Conecte este aparelho uma única vez com o código de ativação fornecido pelo David.</Txt>
      <Field label="Código de ativação" value={code} onChangeText={setCode} secureTextEntry autoCapitalize="none" autoCorrect={false} />
      <Button outline onPress={() => run(async () => { await pairWebPush(code); setPaired(true); setCode(""); setMessage("Aparelho conectado. Agora toque em Ativar notificações."); })}>Conectar aparelho</Button>
    </>}
    {paired && <>
      <Button outline onPress={() => run(enable)}>Ativar notificações</Button>
      <Button outline onPress={() => run(async () => setMessage(await testWebPush()))}>Testar com o app fechado</Button>
      <Button outline onPress={() => run(async () => { await disableWebPush(); refresh(); setMessage("Notificações desativadas neste aparelho."); })}>Desativar notificações</Button>
    </>}
    {busy && <Txt>Aguarde…</Txt>}
    {!!message && <Txt>{message}</Txt>}
    <Txt muted>Os horários são enviados pela internet. Alterações feitas sem conexão serão enviadas quando você reabrir o app com internet. Até lá, os avisos anteriores podem continuar. Os avisos pedem silêncio; confira também a opção Sons nos ajustes do iPhone.</Txt>
  </>;
}
