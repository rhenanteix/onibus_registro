# Licença e atribuição dos dados

Este arquivo explica a base legal e a atribuição dos dados de horário e
percurso republicados por este projeto. Ele descreve o que foi coletado, de
onde veio e em que condições o conteúdo é republicado.

> **Aviso.** Este documento não é parecer jurídico. Ele organiza fatos e
> sugere uma licença para os dados. A escolha final, a revisão e a
> validação de qualquer texto legal cabem aos mantenedores do projeto, que
> devem consultar a prefeitura, a operadora e um profissional de
> propriedade intelectual antes de publicar uma versão definitiva.

## O que está coberto

A licença abaixo se refere apenas aos **dados de transporte**: horários de
saída, itinerários (referências do percurso), nomes e variantes de linha e o
calendário de feriados. Ela **não** se aplica ao código do portal, que
permanece sob a licença MIT do arquivo LICENSE.

## Fonte e data de coleta

| Item               | Conteúdo                                                                                                                          |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Fonte primária     | Portal oficial da Prefeitura Municipal de Registro, seção "Horários de Ônibus": https://registro.sp.gov.br/horarios-de-onibus/    |
| Conteúdo coletado  | Texto público com horários de saída, itinerários por linha e sentido, e o texto original preservado de cada linha                 |
| Data da coleta     | 20/10/2026 (base documental do projeto)                                                                                           |
| Conferência        | `src/data/validation.json` registra as divergências e pendências encontradas entre a página pública e a base versionada           |
| Feriados           | Fontes em `src/data/feriados.json`: portaria federal, lei estadual de São Paulo, Lei Orgânica e decretos do Município de Registro |
| Geometria e pontos | OpenStreetMap (ODbL) e cache de geocodificação anterior, sempre com a origem registrada por referência                            |

## Natureza do dado

- O conteúdo vem de uma página pública de governo e **não** inclui dado
  pessoal, dado de passageiro, dado de bilhete, dado de motorista, posição de
  veículo ou qualquer informação de rastreamento individual.
- O dado é uma **transcrição de informação pública publicada**, com
  reprodução fiel do texto original, incluindo suas próprias notas e
  incertezas. O projeto acrescenta uma representação estruturada, um
  calendário de feriados e uma aproximação geográfica para as referências
  que não têm coordenada publicada.
- As **aproximações geográficas do projeto não são oficiais**: nenhum ponto
  de embarque foi validado pela operadora. `boardingValidated` é `false` em
  todas as referências da base.
- O projeto **não tem vínculo oficial** com a Prefeitura de Registro, com a
  operadora de transporte ou com qualquer órgão público. É uma iniciativa
  independente, mantida pela comunidade.
- A disponibilidade pública de um documento **não constitui, por si só, uma
  licença geral de redistribuição**. As condições de uso ainda precisam ser
  confirmadas com a fonte, que é exatamente o que a minuta de
  `docs/MINUTA-OFICIO.md` propõe.

## Licença sugerida para os dados (a decidir com os mantenedores)

Duas opções são tecnicamente adequadas, com consequências práticas
diferentes. Cabe aos mantenedores escolher uma, ou propor uma terceira:

1. **CC BY 4.0** — permissiva, compatível com reuso em obras abertas e
   fechadas, com atribuição obrigatória. Mais simples de explicar ao usuário
   e adequada a uma transcrição de conteúdo factual.
2. **ODbL (Open Data Commons Open Database License)** — mesma família de
   licenças dos dados do OpenStreetMap que o projeto já usa (com `method` e
   `source` registrados por referência). Exige atribuição e
   compartilhamento pela mesma licença para bases derivadas.

A recomendação dos mantenedores é adotar **ODbL**, por consistência com os
dados do OpenStreetMap que o projeto já distribui, junto de um aviso claro
neste arquivo, depois que a fonte confirmar as condições de uso.

Enquanto a decisão não for formalizada, os dados deste repositório são
publicados **como estão, com atribuição e proveniência preservadas**, e os
mantenedores não devem descrever o conjunto como dados de licença aberta.

## Atribuição exigida

Qualquer reaproveitamento deve manter a atribuição abaixo, além da licença
escolhida pelos mantenedores:

> Horários e itinerários: Prefeitura Municipal de Registro, "Horários de
> Ônibus", coletado em 20/10/2026, via
> https://registro.sp.gov.br/horarios-de-onibus/. Calendário de feriados:
> União (Portaria MGI nº 11.460/2025), Estado de São Paulo (Lei nº
> 9.497/1997), Município de Registro (Lei Orgânica art. 238, Lei Municipal
> nº 1.248/2012, Lei Municipal nº 595/1985 e decretos municipais).
> Georreferenciamento e traçados: contribuidores do OpenStreetMap, ODbL.

## Dados de terceiros

- **OpenStreetMap**: ODbL. A atribuição aparece na camada do mapa e por
  referência em `src/data/journeys.json` (`position.source`).
- **Leaflet, React Leaflet, Lucide, Next.js, React**: licenças próprias,
  listadas em `THIRD_PARTY.md`.
- A licença MIT do projeto não relicencia dados de terceiros.

## O que o projeto não faz

- Não fornece previsões, tempo estimado de chegada nem posição de frota em
  tempo real. `/api/realtime` informa a indisponibilidade de dado de frota.
- Não afirma que qualquer referência é um ponto de embarque oficial.
- Não coleta, armazena nem transmite a localização do usuário: ela fica na
  memória do navegador e é usada só para desenhar o círculo de precisão.
- Não usa publicidade, rastreamento de passageiros nem perfilamento.
