# Estado da implementação

Atualizado em 21/09/2026. Entrega atual: **PWA instalada pelo Safari**, com agenda local e notificações online. Código nativo existe como referência; não foi distribuído IPA nem APK.

| Área | Estado atual |
|---|---|
| Agenda e tarefas | Cadastro, edição, exclusão, recorrências, conflitos e checklist. |
| Medicamentos | Horários, foto opcional, confirmação por dose e histórico. |
| Objetivos | Metas diárias/mensais por tempo e sugestões confirmadas pela usuária. |
| Personalização | Temas, cores, títulos, texto ampliado e decoração. |
| Persistência | Local, com gravações serializadas e mensagens de falha. |
| PIN | Seis dígitos e recuperação local; não criptografa a agenda. |
| Face ID | Apenas referência nativa; indisponível na PWA. |
| Notificações web | Cloudflare Workers + D1 + Web Push. Teste e compromisso real confirmados no iPhone bloqueado. |
| Offline | Pacote cacheado após primeira carga; alterações de avisos sincronizam ao reconectar com app aberto. |
| Backup | Exportação JSON e restauração confirmada; sem PIN nem código privado de ativação. |
| Avatares | Incluídos na versão privada e fora do GitHub público. |

## Limites conhecidos

- Sem sincronização da agenda entre aparelhos nem backup automático na nuvem.
- Sem criptografia própria dos registros e do arquivo de backup.
- Programação web: até 4.000 lembretes dentro de 366 dias; consulte cobertura em Ajustes e abra regularmente para renovar.
- Entrega depende de internet, permissões, Modo Foco e sistema operacional. A consulta ocorre a cada minuto; não há garantia de horário exato.
- Sugestões de atividades são internas ao app; não enviam notificações de incentivo.
- Sugestões usam até 30 minutos por bloco; duração e horário podem ser editados antes da confirmação.
- Aniversários usam eventos anuais; não há tela dedicada com cadastro de nascimento/foto.
- Metas por páginas ou livros não foram implementadas.
- Edição de uma ocorrência cria identidade própria; checklist não é migrado automaticamente para a ocorrência substituída.
- Notificações web permitem som conforme os ajustes do iPhone. Animações permanecem desativadas.

## Verificação e próximos passos

Consulte [a revisão](REVISAO-2026-09-21.md). A conta Cloudflare e a ativação no iPhone já foram concluídas; não há etapa obrigatória de assinatura Apple/Expo para a entrega atual.
