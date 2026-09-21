# Instalar pelo Safari

1. Abra o endereço publicado no Safari do iPhone. A hospedagem atual tem acesso restrito ao proprietário; se solicitado, entre com a conta autorizada de David.
2. Toque em Compartilhar → Adicionar à Tela de Início. Mantenha Abrir como App, se essa opção aparecer.
3. Abra pelo novo ícone, ainda com internet, e crie seu PIN de seis dígitos. Guarde a chave de recuperação fora do app.
4. Em Ajustes, aguarde a mensagem “Pronto para usar offline neste aparelho”.
5. Feche, ative modo avião e reabra pelo ícone para verificar no aparelho.

Não é necessário Apple Developer nem Expo. Não existe IPA nesta modalidade.

## Limitações

- Não há alertas com o app fechado, Face ID ou sincronização entre aparelhos.
- Dados do navegador e do ícone instalado podem ser separados pelo iOS. Crie a agenda no ícone instalado.
- O PIN não criptografa os registros. Faça backup regularmente em Ajustes → Salvar backup. O arquivo não contém o PIN e não é criptografado.
- Restaurar backup substitui a agenda atual após confirmação. Salve antes uma cópia da agenda atual.
- Limpar os dados do site, remover o aplicativo ou o navegador liberar armazenamento pode apagar registros/cache. Não há recuperação na nuvem.
- Atualizações precisam de internet; use Verificar atualização e depois Atualizar agora e reabrir. Atualizar não apaga a agenda.
- A hospedagem está restrita à conta proprietária. Não foi concedido acesso a terceiros.

## Publicação

`npm run build` gera `dist`, incluindo manifesto, ícones e service worker com versão baseada no conteúdo. O worker só guarda recursos do aplicativo; não intercepta páginas de autenticação. A atualização aguarda escolha da usuária, sem recarregar durante uma edição.

`npm run build` usa ilustrações genéricas no lugar dos retratos pessoais. Os avatares locais continuam fora do GitHub público.

## Verificações

TypeScript, regras de agenda, backup e simulação do cache offline foram testados no ambiente de desenvolvimento. A instalação e o comportamento real do Safari no iPhone ainda exigem o teste do passo 5.

Referências: https://docs.expo.dev/guides/progressive-web-apps/
