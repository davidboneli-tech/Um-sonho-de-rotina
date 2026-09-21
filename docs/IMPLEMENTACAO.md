# Estado da implementação — 0.1.0

## Decisão mais recente

Sem sons e sem animações, inclusive no acesso e nas notificações. Avatar estático da Fabi. Ambiente Windows; destino iPhone 12 com iOS 26.2.

## Entregas em código

| Área | Estado |
|---|---|
| Navegação e telas principais | Implementadas em React Native |
| Persistência | AsyncStorage local, gravações serializadas, falhas informadas |
| PIN e recuperação | Implementados; PBKDF2 e SecureStore no iOS |
| Face ID | Integração implementada; aguarda teste em aparelho |
| Eventos e recorrências | CRUD, exceções e divisão de série futura |
| Conflitos | Sobreposição de horários; recorrências verificadas por até 366 dias |
| Dia inteiro | Bloqueia sugestões de horário |
| Pendências | Remarcação explícita, sem mover medicamentos |
| Medicamentos | Cadastro separado, dias/horários/foto, confirmação por dose e histórico preservado |
| Objetivos | Metas em tempo diárias/mensais; tempo real e sugestões dentro da disponibilidade |
| Personalização | Cinco temas, cor, fonte de título, tamanho e decoração |
| Notificações | Integração silenciosa e fila de próximos 60 avisos; aguarda validação iOS |
| Ícone | Criado e incluído no projeto |

## Limitações desta primeira versão

- Ainda sem build nativo assinado, IPA ou instalação no aparelho.
- Meta por páginas/livro e tela específica de aniversários ainda não implementadas. Aniversários podem ser cadastrados como eventos anuais com destaque e lembretes; campos específicos de relação/foto/nascimento ficam para refinamento.
- Incentivos de metas são cartões internos ao abrir a agenda. Não há cobrança automática em segundo plano nem configuração de limite de avisos de metas.
- Seleção de duração para encontrar horário usa até 30 minutos por sugestão; pode-se editar duração/data antes de salvar. Não divide automaticamente uma meta longa em várias sessões.
- Checklist e entrada de data/hora são funcionais, mas podem receber seletores nativos e edição mais detalhada em refinamento.
- Imagens originais de referência possuem fundos e resoluções variados. Foram preservadas; preparar transparência uniforme é melhoria visual, não requisito para funcionar offline.
- Sem criptografia própria do banco da agenda, backup ou exportação dos dados pessoais.
- A cobertura das notificações é limitada aos próximos 60 avisos e exibida em Ajustes; exige reabertura periódica. Não há promessa de cobertura indefinida.
- Edição de uma ocorrência gera novo identificador para separar da série. Registros passados permanecem; itens de checklist não são migrados automaticamente para uma ocorrência substituída.

## Verificação

Ver relatório VALIDACAO.md para comandos e resultados executados. Bundles web e iOS são empacotamentos de JavaScript/recursos, não evidência de compilação nativa.

## Próxima etapa indispensável

Conectar conta Expo/Apple e escolher assinatura/distribuição, então testar no iPhone da Fabi. Corrigir qualquer diferença encontrada antes de uso com dados reais.
