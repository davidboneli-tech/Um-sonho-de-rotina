# Fotos, medicamentos e backup

- No PWA, fotos são normalizadas para JPEG localmente, com lado maior de até 1200 px. O decodificador HEIC/HEIF está incluído no cache offline; nenhuma foto é enviada a um conversor externo.
- Primeiro se tenta a decodificação do navegador. Quando necessário, usa-se `heic-to` 1.5.2 (build CSP, LGPL-3.0). Código-fonte: https://github.com/hoppergee/heic-to ; pacote exato: https://registry.npmjs.org/heic-to/-/heic-to-1.5.2.tgz . Licença distribuída em `public/licenses/heic-to.txt`.
- Medicamentos preservam a programação por dias da semana. O campo opcional `intervalDays` permite intervalos de 1 a 365 dias, ancorados na data de início, respeitando término e pausa. Confirmações, agenda e notificações usam a mesma função de recorrência.
- Backups antigos continuam compatíveis; os novos preservam o intervalo.
- O lembrete de backup aparece na tela Hoje quando não há confirmação neste aparelho ou decorreram 7 dias. O download não confirma automaticamente: a pessoa confirma que salvou o arquivo. Não é backup automático nem notificação com o app fechado.
