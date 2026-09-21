# Plano de implementação

## Situação atual

Planejamento e referências visuais aprovados. Nenhum código de aplicativo, testes em iPhone ou instalação foi realizado neste repositório.

## Decisões técnicas pendentes

- Tecnologia de implementação e versão mínima do iOS.
- Forma de compilar, assinar e instalar para uso pessoal no iPhone.
- Persistência local, migrações e proteção dos dados.
- Agendamento e renovação de notificações dentro das restrições do sistema.
- Estratégia de PIN, Face ID e recuperação local.
- Backup/exportação: decidir se entram na primeira versão.
- Disponibilidade de eventos de dia inteiro e regras de horários silenciosos para cada tipo de aviso.

Não tratar um protótipo web como equivalente automático a um app iOS offline com notificações locais. Validar a solução escolhida antes de prometer o comportamento em segundo plano.

## Etapas

1. Preparar e arquivar telas e ativos aprovados; conferir recortes e formatos.
2. Definir plataforma e instalação, com prova de funcionamento das notificações em iPhone.
3. Criar estrutura modular e protótipo navegável das telas aprovadas.
4. Implementar agenda, tarefas, categorias, participantes e persistência.
5. Implementar recorrências, conflitos, pendências e notificações.
6. Implementar medicamentos e histórico por dose.
7. Implementar objetivos, progresso e sugestões locais de disponibilidade.
8. Implementar temas, acessibilidade, acesso e recuperação.
9. Validar com a Fabi, corrigir problemas e documentar instalação e uso.

A sequência pode mudar por dependência técnica; não há prazos assumidos.

## Estrutura conceitual de dados

| Entidade | Responsabilidade |
|---|---|
| Evento/tarefa | Dados editáveis e modalidade de agendamento |
| Série recorrente | Regra de repetição e alterações futuras |
| Ocorrência | Conclusão, exceções e horário de uma instância |
| Participante | Nome e avatar selecionado |
| Categoria | Nome, imagem e cor |
| Lembrete | Antecedência e vínculo com evento/dose |
| Objetivo | Medida, alvo, período e preferência de incentivo |
| Registro de atividade | Realizado efetivo e vínculo opcional com ocorrência |
| Medicamento | Nome, dose informada e programação |
| Dose prevista | Horário e confirmação individual |
| Preferências | Tema, acessibilidade, disponibilidade e silêncio |

É uma proposta de organização, não um esquema de banco já aprovado ou implementado.

## Validações essenciais

- Criar, editar e consultar dados sem rede; reabrir o app sem perder alterações.
- Exibir apenas destaques no mês e permitir abrir o dia completo.
- Não gerar conflito por uma tarefa sem horário.
- Editar uma ocorrência sem modificar as demais; editar futuras sem apagar histórico.
- Não transferir pendências ou doses automaticamente.
- Atualizar/cancelar notificações ao alterar eventos, com teste no iPhone.
- Confirmar um medicamento sem confirmar outro no mesmo horário; corrigir enganos.
- Contabilizar tempo real sem duplicação e inserir sugestão somente após confirmação.
- Aplicar temas sem perder dados, participantes ou legibilidade.
- Validar PIN, Face ID opcional e código de recuperação; não armazenar segredos no Git.
- Conferir telas pequenas, texto maior, contraste e rótulos de acessibilidade.

## Manutenção documental

Atualizar requisitos quando houver decisão aprovada; registrar alterações e limitações reais junto com o código. README deve distinguir funcionalidades previstas, implementadas e validadas.
