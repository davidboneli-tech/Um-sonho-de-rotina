import React, { useEffect, useState } from 'react';
import { Data, dayKey } from './domain';
import { Button, Card, Title, Txt } from './ui';
import { watchPwa, applyUpdate, checkUpdate, PwaState } from './pwa';
import { backupText, parseBackup } from './backup';
export function PwaTools({data, restore}: {data:Data; restore:(d:Data)=>void}) {
  const [status,setStatus] = useState<PwaState>({ready:false, update:false, error:''});
  const [message,setMessage] = useState('');
  useEffect(() => watchPwa(setStatus), []);
  function exportFile() {
    const blob = new Blob([backupText(data)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=`minha-rotina-${dayKey()}.json`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),60000);
    setMessage('Backup preparado. Confira se o arquivo foi salvo em Arquivos/Downloads. Ele contém seus dados pessoais; guarde em local seguro.');
  }
  function importFile() {
    const input = document.createElement('input'); input.type='file'; input.accept='.json,application/json';
    input.onchange=async()=>{
      const file=input.files?.[0]; if(!file) return;
      try { if(file.size > 20_000_000) throw new Error('Backup maior que 20 MB.'); restore(parseBackup(await file.text())); }
      catch(e) { setMessage((e as Error).message); }
    }; input.click();
  }
  return <>
    <Title small>Instalar no iPhone</Title>
    <Card><Txt>Abra este endereço no Safari, toque em Compartilhar e em Adicionar à Tela de Início. Mantenha “Abrir como App” ativado. Depois abra pelo novo ícone e crie seu PIN ali.</Txt></Card>
    <Txt>{status.ready ? 'Pronto para usar offline neste aparelho.' : status.error ? 'O acesso offline ainda não está pronto.' : 'Preparando o uso offline. Mantenha a conexão nesta primeira abertura.'}</Txt>
    {!!status.error && <Txt>{status.error}</Txt>}
    {status.update ? <Button outline onPress={applyUpdate}>Atualizar agora e reabrir</Button> : <Button outline onPress={()=>checkUpdate().then(()=>setMessage('Verificação concluída. Se houver atualização, a opção aparecerá acima.')).catch(()=>setMessage('Sem conexão para verificar atualizações.'))}>Verificar atualização</Button>}
    <Title small>Backup da agenda</Title>
    <Txt>Os registros ficam somente neste navegador/aparelho. Apagar os dados do site ou remover o app pode apagá-los. Salve uma cópia regularmente. O backup não inclui o PIN e não é criptografado.</Txt>
    <Button outline onPress={exportFile}>Salvar backup</Button>
    <Button outline onPress={importFile}>Restaurar backup</Button>
    {!!message && <Txt accessibilityRole="alert">{message}</Txt>}
  </>;
}
