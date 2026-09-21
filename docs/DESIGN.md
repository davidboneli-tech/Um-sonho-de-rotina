# Design e catálogo visual

## Estado

As telas abaixo foram aprovadas visualmente. São imagens de referência, não telas executáveis. Mudanças funcionais posteriores devem ser incorporadas na implementação mesmo que não apareçam no primeiro mockup.

## Telas aprovadas

| Tela | Conteúdo e comportamento |
|---|---|
| Hoje | Compromissos ilustrados, conclusão, participantes e horário livre |
| Detalhes do evento | Anotações, checklist, local, lembretes, editar, concluir e excluir |
| Criar/editar evento | Formulário com rolagem, imagem, participantes, datas, horários, categoria e opções |
| Meus objetivos | Progresso, registro de atividade, encontrar horário e sugestões com avatar |
| Calendário mensal | Ícones somente nos destaques, lista do dia e acesso ao dia completo |
| Rotinas | Abas Tarefas e Medicamentos; recorrências e confirmações separadas |
| Personalização | Temas, cor, fonte, texto, enfeites, prévia e restauração |

Os mockups iniciais de Hoje tinham quatro abas; a navegação final inclui Objetivos, totalizando cinco. A tela de cadastro deve ganhar as modalidades por período/sem horário e o campo de destaque no mês definidos posteriormente.

Ainda precisam de detalhamento visual: acesso e recuperação, criar objetivo, histórico e cadastro de medicamento, conflitos, pendências, visão semanal e seleção de imagens. Ausência de mockup não significa implementação concluída.

## Temas

| Tema | Cores principais | Motivos |
|---|---|---|
| Jardim delicado | Rosa antigo, creme e verde-sálvia | Flores e ramos |
| Lavanda | Lilás, creme e ameixa | Lavandas e detalhes discretos |
| Rosa de chá | Rosé, bege e marrom | Rosas e corações |
| Céu tranquilo | Azul suave, branco e areia | Nuvens e estrelas |
| Essencial | Creme e cor escolhida | Mínima decoração |

Fontes de títulos: Clássica, Arredondada e Simples. Famílias tipográficas exatas e licenças ainda serão selecionadas. Textos de horários, botões e anotações devem conservar legibilidade.

## Ativos individuais salvos no Drive

[Pasta do projeto](https://drive.google.com/drive/folders/1Lk7apnGmvN9QenoyZ7xi528Ei6vA0PBX)

### Atividades

| Arquivo | Uso |
|---|---|
| 01_Casa.png | Limpeza e organização |
| 02_Roupas.png | Cuidados com roupas |
| 03_Almoco.png | Preparar almoço |
| 04_Leitura.png | Leitura |
| 05_Caminhada.png | Caminhada |
| 06_Alongamento.png | Alongamento |
| 07_Exercicios.png | Exercícios |
| 08_Estudos.png | Estudos pessoais |
| 09_Shopee.png | Trabalho com Shopee |
| 10_Violao.png | Violão |
| 11_Terapia.png | Terapia |
| 12_Aniversarios.png | Aniversários |
| 13_Escola.png | Escola das meninas |
| 14_Salao.png | Salão |
| 15_Igreja.png | Igreja |
| 16_Ballet.png | Ballet |
| 17_Tarefas_escolares.png | Atividades escolares em casa |
| 18_Estudo_para_provas.png | Estudo para provas |
| 19_Medicamentos.png | Marcador padrão de medicamento |

As 18 primeiras foram separadas da prancha aprovada, sem as legendas externas. A imagem de medicamentos foi gerada individualmente. Não presumir fundo transparente, resolução uniforme ou adequação final ao app; preparar e conferir os ativos na etapa de integração.

O estetoscópio apareceu no mockup do calendário, mas ainda não foi produzido como arquivo independente aprovado.

### Família

Avatar_David.png, Avatar_Fabi.png, Avatar_Helena.png e Avatar_Laura.png: versões cartoon em busto, separadas da imagem aprovada.

### Variações da Fabi

| Arquivo | Situação |
|---|---|
| Fabi_Lembrete.png | Lembrar compromisso |
| Fabi_Sugestao.png | Sugerir oportunidade |
| Fabi_Caminhada.png | Incentivar caminhada |
| Fabi_Leitura.png | Incentivar leitura |
| Fabi_Atencao_a_meta.png | Sinalizar progresso pendente |
| Fabi_Comemoracao.png | Comemorar conquista |
| Fabi_Descanso.png | Incentivar pausa |

## Organização dos arquivos

Os arquivos individuais acima foram enviados ao Drive. As propostas e capturas com avatares pessoais permanecem no projeto local e nos materiais privados. Não estão publicadas no repositório público.

Fotos originais da família não são necessárias para consultar a documentação técnica. Não incluir registros reais de medicamentos, PIN, códigos de recuperação ou dados de uso nos exemplos do projeto.

## Integração futura

Exportar tamanhos adequados ao iPhone sem distorcer proporções, conferir bordas e recortes, testar imagem em fundos dos cinco temas e em tamanhos pequenos. Manter imagens locais no pacote final para funcionamento offline. Imagens de referência não substituem controles nativos, textos editáveis nem acessibilidade.

## Decisão final de movimento e áudio

Nenhuma animação e nenhum som. O GIF experimental foi descartado da implementação. O acesso usa o avatar estático da Fabi. Os sete avatares de incentivo continuam como imagens estáticas. O novo ícone do app está em ../assets/icon.png.

As ilustrações de atividades estão versionadas em assets/activities. Avatares em assets/people e assets/fabi são ignorados pelo Git e adicionados localmente. Não foram incluídas fotos originais da família.
