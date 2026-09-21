# Um sonho de rotina

Agenda pessoal para a Fabíola, criada por David Boneli: compromissos, tarefas, medicamentos e tempo para si em um planner visual e acolhedor.

> O aplicativo deve se adaptar à rotina da Fabi, e não obrigar a Fabi a se adaptar ao aplicativo.

## Versão Safari (PWA)

O caminho escolhido é a instalação pelo Safari, sem assinatura Apple ou Expo.
Agenda, medicamentos, objetivos, personalização e PIN funcionam no navegador; o app guarda os arquivos necessários para abrir sem internet após a primeira carga completa.

**Não envia notificações com o app fechado e não oferece Face ID.** Configure avisos necessários no próprio iPhone. Sem sons nem animações.

Em Ajustes há instruções de instalação, status offline, atualização e exportação/restauração de backup. Os registros ficam neste navegador/aparelho, sem sincronização. O PIN controla a entrada, mas não criptografa os dados. O backup JSON também não é criptografado e não inclui o PIN.

### Executar e gerar no Windows

```powershell
npm ci
npm run web
npm run build
```

O comando `build` gera o site instalável em `dist`. Sirva essa pasta por HTTPS. `npm run web` é desenvolvimento e não habilita o cache offline. Veja [instruções Safari](docs/INSTALACAO-SAFARI.md).

As opções nativas anteriores permanecem no código para eventual retomada; não foram gerados instaladores IPA ou APK.

## Implementado

- Hoje, Semana e Agenda; calendário mensal apenas com destaques.
- Cadastro e edição com imagens, participantes, anotações, checklist, local e prioridades.
- Tarefas com horário, por período, sem horário e dia inteiro.
- Recorrências semanais, mensais e anuais; alterações de uma ocorrência ou das futuras.
- Conflitos com opção de manter os dois; pendências sem transferência automática.
- Objetivos diários/mensais por tempo, registro real e sugestões confirmadas pela usuária.
- Medicamentos independentes, foto opcional, horários e histórico de confirmação.
- Cinco temas, cor, títulos, tamanho de texto, decoração e disponibilidade.
- PIN de seis dígitos com derivação PBKDF2, recuperação local e Face ID opcional no iOS.
- Notificações locais apenas no código nativo, indisponíveis na instalação pelo Safari.

A primeira abertura não inclui compromissos ou medicamentos de exemplo.

## Validação

```powershell
npm run typecheck
npm test
npm run export:web
npx expo export --platform ios --output-dir ios-bundle
```

O último comando empacota JavaScript/recursos, **não compila nem assina um IPA**.

## Documentação

- [Requisitos consolidados](docs/REQUISITOS.md)
- [Design e imagens](docs/DESIGN.md)
- [Estado da implementação](docs/IMPLEMENTACAO.md)
- [Instalação e validação no iPhone](docs/INSTALACAO.md)
- [Materiais no Drive](https://drive.google.com/drive/folders/1Lk7apnGmvN9QenoyZ7xi528Ei6vA0PBX)

## Estrutura

- App.tsx: navegação, consultas e coordenação dos fluxos.
- src/domain.ts: regras de agenda, recorrência, metas e doses.
- src/platform.ts: persistência, credenciais e integração nativa.
- src/notificationModel.ts: seleção dos lembretes futuros.
- src/*Form.tsx, Auth.tsx, Goals.tsx, Settings.tsx, ui.tsx: interface.
- assets/: ilustrações genéricas locais; avatares pessoais permanecem fora do Git público.
- tests/: verificações da lógica e teste reproduzível da interface.

Sem licença de redistribuição definida nesta etapa.
