# Instalação e validação no iPhone

Ambiente do David: Windows. Aparelho informado: iPhone 12, iOS 26.2.

## Caminho preparado

React Native com Expo SDK 57 e EAS Build. EAS pode compilar na nuvem, permitindo trabalhar no código no Windows. A compilação iOS nativa local exige macOS/Xcode; não ocorre neste ambiente.

1. Instalar Node.js e Git no Windows, clonar o repositório e executar `npm ci`.
2. Conferir a interface com `npm run web`, usando dados fictícios.
3. Criar/usar conta Expo e conectar o projeto ao EAS: `npx eas-cli@latest login`, depois `npx eas-cli@latest build:configure`.
4. Para distribuição interna num aparelho físico, seguir as exigências vigentes de conta Apple Developer, assinatura e registro do aparelho. Conferir custos e consentir antes de contratar serviço.
5. Registrar o dispositivo quando solicitado: `npx eas-cli@latest device:create`.
6. Gerar build interno: `npx eas-cli@latest build --platform ios --profile preview`.
7. Instalar pelo endereço retornado pelo EAS e executar os testes abaixo.

Nenhuma dessas ações de conta, assinatura ou build foi feita automaticamente. Não foi criado projectId fictício nem embutida credencial. `eas.json` contém perfis preview, simulator e production.

## Offline e notificações

Após instalado com os recursos empacotados, o app não depende de servidor para agenda, PIN, metas e dados. O código não busca os dados no Drive nem no GitHub durante o uso.

As notificações são locais, sem som e sem solicitação de permissão de áudio. Nomes de medicamentos e anotações não aparecem no texto do aviso da tela bloqueada. O app precisa de permissão de notificações.

A implementação agenda os próximos 60 avisos com data concreta e recalcula ao abrir/desbloquear ou modificar a agenda. Ajustes informa o último horário coberto. **Não promete lembretes indefinidamente se a usuária não reabrir o app.** Um volume alto de remédios reduz a cobertura em dias. Validar esse modelo com a Fabi antes do uso definitivo.

## Segurança

Credenciais derivadas com PBKDF2 e salt aleatório. No iOS, ficam no SecureStore/Keychain. PIN incorreto recebe limitação após cinco tentativas; recuperação troca PIN e código. Face ID é opcional.

O PIN é um bloqueio de acesso à interface. Esta versão usa AsyncStorage para a agenda e **não implementa criptografia própria de todo o banco**. O navegador de desenvolvimento guarda também as credenciais derivadas no armazenamento local; não deve receber dados sensíveis reais. Backup e recuperação após perda/desinstalação não estão implementados. Código de recuperação não é backup.

## Checklist no aparelho

- Abrir em modo avião após instalação.
- Criar PIN, guardar código, bloquear, testar PIN errado e recuperação.
- Testar Face ID habilitado, negado e indisponível.
- Cadastrar eventos, fechar/reabrir e confirmar persistência.
- Confirmar somente uma de duas doses no mesmo horário.
- Alterar e pausar medicamento sem perder confirmações históricas.
- Agendar aviso próximo, bloquear aparelho e verificar apresentação silenciosa.
- Editar/excluir compromisso e confirmar cancelamento do aviso anterior.
- Verificar nenhum som, vibração programada, GIF ou animação de tela.
- Conferir texto maior, teclado e áreas seguras do iPhone.

## Fontes técnicas

- [EAS Build](https://docs.expo.dev/build/introduction/)
- [Distribuição interna](https://docs.expo.dev/build/internal-distribution/)
- [Notificações locais](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)

Consultar as exigências atuais ao gerar o build; a exportação JavaScript não prova instalação nem entrega de notificações.

## Avatares pessoais

O repositório é público. Para preservar os retratos, os arquivos da família não são enviados ao GitHub. Antes de gerar o app personalizado, baixe da pasta do Drive e coloque:

- Avatar_David.png, Avatar_Fabi.png, Avatar_Helena.png e Avatar_Laura.png em assets/people/.
- Fabi_Sugestao.png e as demais variações em assets/fabi/.

Execute `npm run prepare`. O gerador local referencia as imagens presentes. Sem elas, usa o ícone do planner, permitindo executar o projeto sem arquivos privados.

No ambiente desta implementação, os avatares já estão nessas pastas. A configuração .easignore permite que integrem o pacote privado de compilação quando o usuário decidir iniciar um build EAS. Isso não os envia ao GitHub. Nunca versionar src/avatars.generated.ts.
