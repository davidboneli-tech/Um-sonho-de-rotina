import React, { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { Data, dayKey } from './domain';
import { backupText } from './backup';
import { backupDue, confirmBackup, lastBackup } from './backupReminder';
import { Button, Card, Title, Txt } from './ui';

export function BackupExport({ data, onConfirmed }: { data: Data; onConfirmed?: () => void }) {
  const [prepared, setPrepared] = useState(false);
  const [message, setMessage] = useState('');
  function exportFile() {
    try {
      const blob = new Blob([backupText(data)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `minha-rotina-${dayKey()}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      setPrepared(true);
      setMessage('Confira se o arquivo foi salvo em Arquivos/Downloads. Depois confirme abaixo.');
    } catch { setMessage('Não foi possível preparar o backup. Tente novamente.'); }
  }
  return <>
    <Button outline onPress={exportFile}>Salvar backup</Button>
    {!!message && <Txt accessibilityRole="alert">{message}</Txt>}
    {prepared && <Button onPress={async () => {
      try { await confirmBackup(); setPrepared(false); setMessage('Backup confirmado. O próximo lembrete será em 7 dias.'); onConfirmed?.(); }
      catch { setMessage('Não foi possível registrar a confirmação. Tente novamente.'); }
    }}>Confirmei que o arquivo foi salvo</Button>}
  </>;
}

export function BackupReminder({ data }: { data: Data }) {
  const [due, setDue] = useState(false);
  useEffect(() => {
    let active = true;
    const check = () => lastBackup().then(last => { if (active) setDue(backupDue(last)); }).catch(() => { if (active) setDue(true); });
    check();
    const timer = setInterval(check, 60000);
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') check(); });
    return () => { active = false; clearInterval(timer); subscription.remove(); };
  }, []);
  if (!due) return null;
  return <Card alternate>
    <Title small>Hora do backup</Title>
    <Txt>Guarde uma cópia da sua agenda. Este lembrete volta a cada 7 dias após sua confirmação.</Txt>
    <BackupExport data={data} onConfirmed={() => setDue(false)} />
  </Card>;
}
