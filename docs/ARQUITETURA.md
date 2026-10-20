# Arquitetura e mapa de componentes

## Telas e camadas

| Arquivo | Responsabilidade |
|---|---|
| `src/app/layout.tsx` | HTML, metadados, manifest, navegação e instalação global |
| `src/app/page.tsx` | Server Component: obtém catálogo diretamente no repositório |
| `src/components/mobility/MobilityPortal.tsx` | Coordena seleção da linha, destino, sentido, dia, referência e painel mobile |
| `src/components/mobility/LineCard.tsx` | Seleção acessível de linha e favorito |
| `src/components/mobility/Timetable.tsx` | Grade, dia da viagem, sinalização de saídas incertas e aviso de feriado em uso |
| `src/components/mobility/HolidayCalendar.tsx` | Lista de feriados do ano com a fonte oficial de cada data |
| `src/components/mobility/JourneyTimeline.tsx` | Sequência numerada, situação de localização, distância e vínculo com mapa |
| `src/components/map/TransitMap.tsx` | React Leaflet; marcador agrupado por coordenada, shape tracejado, precisão e foco |
| `src/components/layout/Footer.tsx` | Rodapé do portal com o link para a licença dos dados |
| `src/components/pwa/InstallPrompt.tsx` | Ciclo da instalação, recusa temporária, instruções por plataforma e cache inicial |
| `src/hooks/useGeolocation.ts` | Permissão explícita, watchPosition, erros, pausa por visibilidade e limpeza |
| `src/hooks/useFavorites.ts` | Favoritos locais com chave versionada e recuperação de storage inválido |
| `src/lib/domain.ts` | Normalização de busca, calendário SP, data local de São Paulo, próxima saída e distância geográfica |
| `src/lib/feriados.ts` | Calendário de feriados: validação de schema, consulta por data e escolha da grade do dia |
| `src/lib/references.ts` | Situação de localização das referências e contagem por linha |
| `src/lib/markdown.ts` | Markdown das páginas públicas: títulos rebaixados um nível, HTML bruto descartado, endereços externos filtrados |
| `src/types/transit.ts` | Contratos TypeScript de dados e interface |
| `src/server/transit-repository.ts` | Fronteira servidor/dados; ponto de substituição por Postgres/GTFS |
| `src/server/openapi-spec.ts` | Especificação OpenAPI da API de leitura, com versão, servidores e exemplos conferidos por teste |
| `src/app/projeto/page.tsx` | Descrição pública de UX, arquitetura, implementações e roadmap |
| `src/app/docs/page.tsx` | Índice da documentação: API, roadmap, licença e projeto |
| `src/app/docs/api/page.tsx` | Referência OpenAPI renderizada por Redoc, com retorno ao índice, aviso quando o CDN externo falha e carregamento só após o clique |
| `src/app/licenca/page.tsx` | Licença e atribuição dos dados e minuta de ofício, lidas de DATA_LICENSE.md e docs/MINUTA-OFICIO.md |
| `src/app/roadmap/page.tsx` | Roadmap e changelog lidos de ROADMAP.md e CHANGELOG.md versionados |
| `tests/` | Testes do runner nativo do Node: domínio e integridade, feriados, referências, privacidade, markdown e estilo |
| `public/sw.js` | Cache offline apenas da página simplificada, scripts, ícones e catálogo |
| `public/offline.html`, `public/offline.js` | Consulta offline sem dependência do bundle Next |
| `tools/import/` | Importadores Python de manutenção, fora do backend |
| `tools/reports/referencias.ts` | Relatório reproduzível das referências e conferência do campo `locationStatus` |

## API em Node.js
`GET /api/catalog`: `{data: Catalog, meta: {source, updatedAt, fleetRealtime}}`. O cache HTTP tem 60 segundos e stale-while-revalidate de 300 segundos. A consulta manual usa no-store no cliente; a fonte é a base versionada, não uma coleta em tempo real.
`GET /api/lines/L3`: `{data: {line, journeys, schedules, route}}`. Linha inexistente retorna HTTP 404 e `{error}`. ID é normalizado para maiúsculas.

`GET /api/realtime`: `{available: false, vehicles: [], reason}`. Resposta sem cache; não existem posições simuladas ou chamada a fornecedor sem autorização.

`GET /api/openapi` (e o atalho `GET /api/docs`): especificação OpenAPI 3.0.3 gerada em `src/server/openapi-spec.ts`. O servidor de produção declarado é o site publicado, a versão acompanha a do `package.json` e os exemplos de ID de linha existem na base versionada; um teste impede que a especificação volte a prometer dado de frota em tempo real.

Todas as rotas são de leitura pública e não recebem coordenadas, nomes ou cartões dos passageiros. Não há endpoints de escrita sem autenticação.

## Evolução do backend

O próximo incremento deve manter o contrato do repositório e trocar seu adaptador por PostgreSQL/PostGIS. Tabelas sugeridas: agencies, routes, directions, stops, stop_sequences, shapes, service_calendars, calendar_exceptions, trips, stop_times, source_versions. O modelo deve guardar status de validação e vigência; migrar os JSON exige revisão dos casos incertos, não apenas importação cega.

Administração: autenticação, autorização por perfil, rascunho, revisão, publicação transacional, trilha de auditoria. Fotos em armazenamento de objetos com direitos de uso e moderação. Não usar JSON local para gravação em produção serverless.

Tempo real: um adaptador de fornecedor deve normalizar posição, timestamp, identificação do veículo/viagem e precisão. Persistir última posição e rejeitar dados antigos antes da exibição. A previsão de chegada precisa de stop_times e histórico, não somente distância linear.

NestJS pode ser extraído como serviço dedicado se surgirem ingestão contínua, múltiplos consumidores ou tarefas de integração. Nesta entrega o backend funcional já está em Next.js/Node; não é necessário manter dois servidores só para leitura de catálogo.

## Deploy

Servidor Next.js (não export estático). Vercel executa APIs em Node e hospeda os arquivos públicos. `vercel.json` seleciona nextjs; não usar outputDirectory dist. Sem variáveis de ambiente obrigatórias. Não é possível hospedar as APIs apenas com GitHub Pages.
