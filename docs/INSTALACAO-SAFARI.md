# Instalar pelo Safari

1. Abra o endereço publicado no Safari do iPhone. A hospedagem atual tem acesso restrito ao proprietário; se solicitado, entre com a conta autorizada de David.
2. Toque em Compartilhar → Adicionar à Tela de Início. Mantenha Abrir como App, se essa opção aparecer.
3. Abra pelo novo ícone, ainda com internet, e crie seu PIN de seis dígitos. Guarde a chave de recuperação fora do app.
4. Em Ajustes, aguarde a mensagem “Pronto para usar offline neste aparelho”.
5. Feche, ative modo avião e reabra pelo ícone para verificar no aparelho.

Não é necessário Apple Developer nem Expo. Não existe IPA nesta modalidade.

## Limitações

- Lembretes online funcionam com o app fechado após ativação e sincronização. Não há Face ID nem sincronização da agenda entre aparelhos.
- Dados do navegador e do ícone instalado podem ser separados pelo iOS. Crie a agenda no ícone instalado.
- O PIN não criptografa os registros. Faça backup regularmente em Ajustes → Salvar backup. O arquivo não contém o PIN e não é criptografado.
- Restaurar backup substitui a agenda atual após confirmação. Salve antes uma cópia da agenda atual.
- Limpar os dados do site, remover o aplicativo ou o navegador liberar armazenamento pode apagar registros/cache. Não há recuperação na nuvem.
- Atualizações precisam de internet; use Verificar atualização e depois Atualizar agora e reabrir. Atualizar não apaga a agenda.
- A hospedagem está restrita à conta proprietária. Não foi concedido acesso a terceiros.

## Publicação

`npm run build` gera `dist`, incluindo manifesto, ícones e service worker com versão baseada no conteúdo. O worker só guarda recursos do aplicativo; não intercepta páginas de autenticação. A atualização aguarda escolha da usuária, sem recarregar durante uma edição.

O repositório público usa o ícone como alternativa quando os retratos não estão disponíveis. A hospedagem privada inclui os avatares autorizados, também no pacote offline.

## Verificações

TypeScript, regras de agenda, backup e simulação do cache offline foram testados no ambiente de desenvolvimento. David confirmou a entrega do teste e de um compromisso real com o iPhone bloqueado em 21/09/2026. Edição/exclusão, medicamentos, reconexão e download/restauração pelo seletor do iPhone ainda precisam de conferência no aparelho.

Referências: https://docs.expo.dev/guides/progressive-web-apps/

## Versão privada com avatares

A hospedagem privada inclui os quatro avatares e a Fabi das sugestões no pacote offline. O GitHub público permanece sem esses retratos. O histórico da cópia privada não deve ser enviado ao repositório público.

## Uso dos lembretes

Após criar, editar ou excluir um registro, aguarde “Avisos online sincronizados”. Alterações offline aguardam reconexão com o app aberto. O iPhone precisa de conexão para receber novos avisos. Abra o app regularmente para renovar a programação. Não refaça a ativação se os lembretes já funcionam.
