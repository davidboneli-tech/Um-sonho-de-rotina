# Lembretes online — implementação e ativação

## Estado

Cliente PWA e serviço de notificações implementados. **O serviço ainda precisa ser provisionado na conta Cloudflare do proprietário e validado no iPhone.** A versão publicada informa que aguarda configuração; não anuncia notificações ativas.

## Funcionamento

- O iPhone deve abrir o PWA pelo ícone da Tela de Início; a permissão só é solicitada após toque em Ativar notificações.
- Um Worker independente na Cloudflare consulta D1 a cada minuto, cifra os avisos com Web Push (AES128GCM + VAPID) e os envia ao serviço push da Apple. Não precisa de Mac nem de assinatura Apple Developer.
- O site continua na hospedagem privada atual. A conta Cloudflare abriga apenas o serviço de envio, não os avatares nem a agenda completa.
- São enviados apenas identificadores, horários absolutos e mensagens genéricas de compromisso/medicamento. PIN, nomes dos remédios, doses, anotações e avatares não são enviados.
- Editar, excluir, pular ou concluir atualiza a programação ao sincronizar. Mudanças sem internet aguardam a conexão com o app aberto; avisos já enviados ao sistema não podem ser recolhidos.
- O app envia até 4.000 lembretes, calculados dentro de 366 dias. A tela informa até quando estão programados; abrir regularmente renova o período. Não depende de o app permanecer aberto depois de sincronizar.
- Não há garantia de entrega pontual: execução a cada minuto, conexão, Modo Foco, permissões e sistema operacional podem atrasar/impedir a entrega. Avisos vencidos há mais de dez minutos não são reenviados pelo servidor. TTL de cinco minutos no provedor.
- `silent: true` pede ausência de som/vibração. Verificar também Sons nos ajustes de notificações do iPhone.
- Sugestões de atividade continuam dentro da agenda; esta etapa envia compromissos configurados e lembretes individuais de medicamentos.

## Provisionamento (uma vez, pelo responsável técnico)

Requer conta Cloudflare autorizada, Node.js 22+ e acesso a Workers/D1. A integração foi dimensionada para uso familiar no plano gratuito, sujeito às cotas do provedor; não habilitar plano pago automaticamente.

Na pasta `notifications`:

1. `npm ci`
2. `npx wrangler login` (autorizar na conta do proprietário; não enviar senha em conversa).
3. `npx wrangler d1 create sonho-notificacoes`
4. Copiar o `database_id` retornado para `wrangler.jsonc`. Não inventar esse identificador.
5. `npx wrangler d1 migrations apply sonho-notificacoes --remote`
6. `npm run keys` gera `.push-secrets.json`, ignorado pelo Git. Guardar cópia segura; não regenerar chaves de uma instalação existente.
7. `npx wrangler secret bulk .push-secrets.json`
8. `npm run deploy`
9. Copiar a URL HTTPS real do Worker, sem barra final, para `src/pushConfig.ts` (`PUSH_API_URL`). O token NÃO pertence a esse arquivo ou ao código do app.
10. Publicar o app existente pelo fluxo Sites. O endereço privado e os dados locais permanecem iguais.
11. No iPhone, atualizar o app. Conectar uma vez com o valor privado de `PUSH_TOKEN`; permitir notificações e realizar o teste com o app fechado. O código fica apenas neste aparelho e não entra no backup da agenda.

`APP_ORIGIN` deve ser exatamente a origem publicada do app. Requisições de outras origens e sem o token privado são rejeitadas. Aceitamos apenas endpoints HTTPS conhecidos da Apple, Google e Mozilla, sem redirecionamentos. Rotacionar o token se houver vazamento. Para revogar um aparelho, apagar seu registro em `devices`; a chave estrangeira remove sua programação.

## Verificação

- `npm test` em `notifications`: SQLite real em memória, autorização/CORS, endpoints permitidos, privacidade, atualização/exclusão, criptografia real da biblioteca, repetição, tentativas e inscrições expiradas.
- `npm run check` em `notifications`: empacotamento de Worker, sem publicação.
- Testes do projeto principal validam domínio, backup e service worker offline. Teste de push no service worker verifica silêncio e abertura da agenda.
- Ainda obrigatório antes de anunciar pronto: ativar no iPhone, receber teste com tela bloqueada, testar edição/exclusão e reconexão após alteração offline.

Fontes técnicas: [WebKit](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/), [Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/), [D1](https://developers.cloudflare.com/d1/worker-api/d1-database/), [WebCrypto Web Push](https://github.com/block65/webcrypto-web-push).
