# Um sonho de rotina

Agenda pessoal para a Fabíola, criada por David Boneli: compromissos, tarefas, medicamentos e tempo para si em um planner visual e acolhedor.

> O aplicativo deve se adaptar à rotina da Fabi, e não obrigar a Fabi a se adaptar ao aplicativo.

## Versão 0.1.0 — implementação inicial

Código React Native + Expo, preparado para iPhone e editável no Windows. **Sem sons e sem animações.** Avatar estático da Fabi no acesso quando os arquivos pessoais são adicionados localmente. Sem esses arquivos, aparece o ícone do planner. Dados e imagens ficam locais na versão instalada.

**Ainda não é um instalador assinado para iPhone.** TypeScript, testes da lógica e empacotamento JavaScript são verificáveis neste ambiente; Face ID, notificações e instalação precisam de validação no aparelho. Consulte [estado e limites](docs/IMPLEMENTACAO.md).

## Executar no Windows

Instale Node.js LTS compatível com Expo SDK 57 e Git. No PowerShell:

```powershell
git clone https://github.com/davidboneli-tech/Um-sonho-de-rotina.git
cd Um-sonho-de-rotina
npm ci
npm run web
```

A versão web serve para conferir a interface usando dados fictícios. Não agenda notificações locais no iPhone, não tem Face ID e não é a entrega offline nativa.

Para trabalhar com o projeto Expo:

```powershell
npm start
```

Para criar a versão instalada no iPhone, veja [INSTALACAO.md](docs/INSTALACAO.md). O perfil EAS está preparado, mas nenhum build pago, assinatura Apple ou publicação foi iniciado.

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
- Integração de notificações locais silenciosas, com renovação de até 60 próximos avisos.

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
