> Decisão atual: entrega pelo Safari/PWA, sem assinatura Apple, sons ou animações. Notificações locais nativas e Face ID abaixo são referências para uma eventual versão nativa. Consulte [instalação Safari](INSTALACAO-SAFARI.md).

# Memorial consolidado — Um sonho de rotina

Versão documental: 1.0 · 21/09/2026  
Estado: requisitos aprovados. Consulte IMPLEMENTACAO.md para o estado de cada entrega.

**Decisão final:** nenhum som e nenhuma animação, inclusive na tela de acesso. A Fabi aparece em imagem estática. Notificações locais permanecem visuais e silenciosas. Ambiente: Windows; aparelho alvo informado pelo usuário: iPhone 12 com iOS 26.2.

Este documento consolida o memorial inicial e as decisões posteriores da conversa. Quando uma decisão foi refinada, prevalece a regra abaixo. Exemplos de horários, metas e medicamentos em mockups são demonstrativos.

## 1. Finalidade e plataforma

Aplicativo de uso pessoal da Fabíola, para iPhone, totalmente offline. Reunir agenda, tarefas, rotinas, aniversários, objetivos e lembretes sem aparência empresarial. Dados locais; nenhuma conta online é requisito para o uso cotidiano.

Organizar atividades domésticas pela manhã, aproximadamente até 13h30, e reservar espaço à tarde para leitura, caminhada, alongamento, estudos, trabalho com Shopee, descanso e projetos pessoais. Esses períodos são configuráveis, não bloqueios rígidos.

Compromissos informados no memorial: violão na segunda, das 16h às 17h, e terapia na sexta, das 8h às 9h. São referências iniciais editáveis, não dados automaticamente cadastrados nesta fase.

## 2. Organização e navegação

Navegação principal: Hoje, Calendário, Rotinas, Objetivos e Ajustes.

### Hoje, Semana e Agenda

Mostrar atividades e compromissos com imagens, horário quando houver, participantes e acesso aos detalhes. Permitir conclusão individual. A visão semanal reúne também as rotinas; Agenda apresenta os registros em ordem cronológica.

Três modalidades:
- Com horário: data, início e fim.
- Por período: manhã, tarde ou noite, sem reserva artificial de um intervalo exato.
- Sem horário: atividade prevista para o dia, apresentada em “Para fazer hoje”.

### Calendário mensal

Mostrar somente destaques escolhidos, como consulta, evento escolar, aniversário e apresentação especial. Rotinas domésticas, aulas regulares de violão e ballet, terapia recorrente e medicamentos não ocupam o mês por padrão.

O campo “Destacar no calendário mensal” controla essa exibição independentemente da recorrência e dos lembretes. Uma apresentação de ballet pode aparecer, mesmo que a aula regular não apareça.

Cada data mostra pequenas imagens; limitar a três e indicar excedentes com “+N”. Ao selecionar uma data, mostrar abaixo seus destaques, horários e participantes. “Ver dia completo” abre também as atividades de rotina. Não misturar os enfeites do tema com os marcadores de eventos.

## 3. Eventos e detalhes

Permitir criar, consultar, editar e excluir:
- Título e imagem da atividade.
- Data; início e fim quando aplicáveis; dia inteiro.
- Categoria e prioridade.
- Um ou mais participantes identificados pelos avatares.
- Local, anotações e checklist de itens.
- Recorrência e um ou mais lembretes.
- Destaque no calendário mensal.

Prioridades: Obrigatório, Importante e Se der tempo. Permitir novas categorias e edição de seus nomes.

Ao tocar em um evento, abrir seus detalhes. Exemplo: aula de violão com anotação de música para estudar e checklist para levar instrumento, dinheiro e partitura. Os exemplos não devem virar registros reais sem cadastro.

Ações: editar, concluir e excluir. Excluir exige confirmação. Concluir um item do checklist não deve concluir automaticamente todo o evento.

## 4. Conflito de horários

Antes de salvar um compromisso com início e fim, verificar sobreposição com os existentes. Mostrar qual compromisso conflita e permitir:
- Ver o compromisso existente.
- Alterar o novo horário.
- Manter os dois.
- Cancelar o cadastro.

Não impedir automaticamente. Tarefas por período e sem horário não reservam blocos nem geram conflito por si mesmas. Tratamento de eventos de dia inteiro na disponibilidade será definido na implementação.

## 5. Rotinas e ocorrências

Recorrência configurável por dias da semana, frequência mensal ou anual. Cada ocorrência tem conclusão independente.

Permitir “Pular hoje” sem excluir a rotina. Nas edições, oferecer “Só desta vez” ou “Esta e as próximas”, preservando ocorrências e registros passados. Isso refina a ideia inicial de editar “toda a série”.

Alterações de horário e cancelamentos devem atualizar os lembretes correspondentes.

## 6. Pendências

Atividades não concluídas aparecem em “Ficou para depois”. Opções: fazer hoje, escolher outra data ou cancelar. Não transferir automaticamente para evitar acúmulo.

Compromissos com horário permanecem em sua data original; não se tornam obrigações do dia seguinte. Medicamentos seguem controle próprio, nunca o fluxo genérico de transferência de tarefas.

## 7. Notificações e aniversários

Notificações locais, com autorização da usuária. Configurações de aviso no horário, 10 ou 30 minutos antes, 1 hora antes, algumas horas antes, 1 dia antes ou horário personalizado. Permitir desativar individualmente e incluir múltiplos lembretes.

Não solicitar som nem incluir áudio nas notificações. A apresentação visual depende das permissões e ajustes do iOS, inclusive modos Foco. Validar agendamento e renovação em aparelho real; não presumir quantidade ilimitada de alertas pendentes.

Aniversários: nome, data, relação, observação, foto opcional e repetição anual. Avisos configuráveis, como 7, 3 ou 1 dia antes e no dia.

## 8. Objetivos e organização do tempo

Área “Meus objetivos” para metas diárias e mensais. Exemplos aprovados: caminhar 10 horas no mês e ler 2 horas por dia. Proposta adicional: terminar livro, com página atual e data desejada.

Registrar progresso pelo realizado, não pelo tempo apenas reservado. Ao concluir, sugerir a duração prevista e permitir corrigir para o tempo real. Possibilitar registro manual de atividade não agendada e evitar contagem duplicada entre confirmação do evento e registro da meta.

Duas formas de ajuda:
- “Encontrar horário”, acionado pela usuária.
- Sugestões espontâneas na tela Hoje e em Objetivos.

Considerar compromissos, duração e períodos permitidos, preservando descanso e horários indisponíveis. Oferecer blocos menores quando adequado. Só inserir na agenda após confirmação.

Permitir editar, pausar e reorganizar metas. Se não houver disponibilidade, oferecer reduzir, adiar ou pausar; não comprimir a agenda automaticamente.

Acompanhamento por objetivo: Só acompanhar, Incentivo gentil ou Lembrete firme. Padrão: Incentivo gentil. Definir horários de silêncio e limitar avisos. Sugestões e cálculos funcionam localmente; não dependem de IA online.

## 9. Medicamentos

Cadastro separado para cada medicamento. Não agrupar confirmações.

Campos: nome, dose informada pela usuária, horários, dias de uso e foto opcional da embalagem. A ilustração padrão pode ser compartilhada sem unificar os cadastros.

Cada dose prevista gera um item independente, com lembrete e botão “Tomei”. Registrar data e hora da confirmação, permitindo correção de engano. Dois medicamentos no mesmo horário continuam sendo dois itens.

Histórico por medicamento e ocorrência, distinguindo confirmado, programado e sem registro. Ausência de confirmação não prova que a dose não foi tomada.

Não transferir doses automaticamente, recomendar dose ou compensar esquecimento. O app organiza o que foi cadastrado.

Medicamentos aparecem em Hoje e na aba Medicamentos de Rotinas, sem poluir o mês. “Medicamento A/B/C/D” e horários dos mockups são exemplos, não prescrições nem cadastros reais.

## 10. Personalização e avatares

Cinco temas: Jardim delicado, Lavanda, Rosa de chá, Céu tranquilo e Essencial. Ajustes opcionais de cor principal, fonte dos títulos, tamanho do texto e enfeites: nenhum, discreto ou florido.

Manter textos funcionais legíveis. Oferecer prévia, aplicação explícita e restauração do tema original. Trocar tema não troca as imagens escolhidas para tarefas nem os avatares.

Cada atividade tem imagem; participantes recebem avatares em busto. Avatares aprovados: David, Fabi, Helena e Laura. Uma tarefa pode envolver mais de uma pessoa.

Sete versões cartoon da Fabi acompanham situações de lembrete, sugestão, caminhada, leitura, atenção à meta, comemoração e descanso. Usar cartões discretos, sem cobrir controles ou exigir interrupções constantes.

Aparência de notificação do sistema não é igual à de um cartão interno. Imagem anexada em notificação é possibilidade técnica a validar, não promessa de avatar animado sobre outras telas.

## 11. Acesso e recuperação

Aprovado: PIN de seis dígitos, Face ID opcional e código de recuperação gerado na configuração inicial para guardar fora do app.

Recuperação local, sem e-mail ou servidor. Fluxo deve permitir redefinir acesso após validar o código. Arquitetura de proteção, armazenamento seguro e limite de tentativas serão definidos e validados na implementação.

Não confundir código de recuperação com backup: recuperar acesso não recupera dados de um aparelho perdido.

## 12. Expansão

Arquitetura modular para permitir diário, hábitos, estatísticas, relatórios, widgets, backup, exportação e novos lembretes no futuro. Esses recursos não estão todos aprovados para a primeira versão.

As metas, medicamentos e personalização foram acrescentados ao escopo atual durante a conversa e não devem ser descartados por constarem como expansão no memorial inicial.

## 13. Critérios gerais

Poucos toques para ações comuns; cores e imagens como apoio à identificação; decoração moderada; confirmação de ações destrutivas; funcionamento sem conexão. Todos os exemplos visuais devem ser substituídos por dados cadastrados ou estado vazio na versão funcional.
