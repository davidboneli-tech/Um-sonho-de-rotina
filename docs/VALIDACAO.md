## Correção do offline no Safari

A verificação HTTP da publicação encontrou dois problemas reais que a primeira simulação não cobria: `/index.html` redireciona para `/`, e as URLs de fontes com `@expo` redirecionavam e retornavam HTML. O instalador offline rejeitava essas respostas; a fonte Ionicons também não carregava no aparelho.

Correções: cache da página pelo endereço canônico `/`, ícones web em SVG embutido (sem fonte externa), rejeição de HTML no lugar de imagens/scripts e limpeza do aviso de erro após nova tentativa bem-sucedida. O pacote web passou de 46 para 27 arquivos. O teste agora reproduz o redirecionamento de index.html e impede URLs de fontes problemáticas no pacote. Os dados locais e suas chaves de armazenamento foram preservados.

## Entrega Safari/PWA

TypeScript e 12 testes automatizados passaram. Os testes novos validam exportação/restauração do backup e simulam o service worker com a rede desligada: documento e ícones vêm do cache, páginas de autenticação não são interceptadas e a atualização depende da ação da usuária. A exportação web de produção foi concluída.

Ainda falta validar no Safari físico: instalação pela Tela de Início, encerramento/reabertura em modo avião e exportação de backup para Arquivos. A simulação do cache não substitui esse teste.

# Validação da versão 0.1.0

Executada em ambiente Linux de desenvolvimento em 21/09/2026, com dados fictícios.

## Resultados

- TypeScript: `npm run typecheck` passou.
- Lógica: 10 testes passaram com `npm test`.
- Bundle web: exportado com Expo.
- Bundle JavaScript iOS: exportado com Expo; não equivale a compilação Xcode/IPA.
- Fluxo de interface em Chromium, viewport 390 × 844: passou.

O teste de interface cria um PIN fictício, abre a agenda, cadastra/edita um evento, cria meta, registra tempo, cadastra dois medicamentos, confirma apenas um, recarrega a página e verifica persistência, abre o calendário e aplica um tema.

Capturas produzidas localmente em tests/screenshots/ e omitidas do Git público por conterem os avatares pessoais. O teste pode recriá-las.

## Reproduzir

```sh
npm ci
npm run typecheck
npm test
npm run export:web -- --output-dir web-build
npx playwright install chromium
node tests/interface.cjs
```

O teste inicia um servidor HTTP local apenas enquanto roda. Opcionalmente `SONHO_BROWSER_PATH` aponta para Chromium instalado. Não são utilizados serviços externos de dados pessoais.

## Não validado neste ambiente

Instalação no iPhone, Face ID, comportamento do Keychain, chegada de notificações com app fechado, modo avião no build assinado e aparência nos componentes nativos. Esses itens exigem o dispositivo e a assinatura.

A exportação reportou aviso de fallback de resolução de subcaminho de @noble/hashes. Os bundles foram gerados e o PIN foi exercitado na interface web; manter observação na compilação nativa.
