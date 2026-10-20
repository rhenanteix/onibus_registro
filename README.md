# Mobilidade em Registro

Portal estático com PWA, consulta de horários, percurso de referência e localização do usuário.

## Stack atual
- Frontend: HTML, CSS responsivo e JavaScript nativo. Sem React ou Next.js.
- Mapas: Leaflet 1.9.4 hospedado localmente, mapa base OpenStreetMap.
- Dados: JSON e GeoJSON versionados; favoritos no localStorage.
- PWA: manifest e service worker (cache de shell, bibliotecas e dados).
- Backend/API/banco de dados próprios: **não implementados**. Não há servidor Node.js/NestJS em execução atendendo o portal.
- Python: scripts de importação e preparação offline, não backend.
- Publicação estática pelo Sites.

## Estrutura
`dist/index.html`: interface. `dist/style.css`: estilos. `dist/app.js`: navegação, busca, horários, geolocalização e mapa. `dist/lines.json`: cadastro e itinerários; `dist/schedules.json`: saídas, variantes e pendências; `dist/routes.json`: cinco traçados inferidos em dois sentidos; `dist/stops.json`: três locais OSM sem associação de linhas; `dist/validation.json`: inconsistências da fonte; `dist/sw.js` e `dist/manifest.webmanifest`: PWA. `source-itineraries.txt`: material público enviado pelo usuário. `import_itineraries.py`: importa horários. `prepare_references.py`: deriva sequência textual. `update_route_directions.py`: prepara shapes estimados. `geocoding.json`: referências geográficas usadas.

## Fonte e validação em 20/10/2026
Material fornecido comparado com https://registro.sp.gov.br/horarios-de-onibus/ . 11 linhas regulares e quatro grupos universitários (8 viagens/códigos) digitalizados. Os 499 registros são saídas publicadas, incluindo duplicidades/grades conflitantes; não correspondem a 499 viagens operacionais confirmadas. A fonte contém interrogações, títulos inconsistentes, horários de variantes diferentes e conflitos (L9 sábado, L4 atualização sem ano, R4 origem/itinerário, L8 códigos). Esses casos são preservados e identificados; não resolvidos por suposição. Saídas marcadas incertas não participam do destaque de próxima saída. Grade R6 somente terça/quarta/sexta. Universitários preservam o código U52 da fonte. L5 domingo atualizado conforme fonte enviada, substituindo informação anterior.

## Percursos
L3/L4/L5/L7/L9: cinco geometrias **inferidas**, não homologadas, em dois sentidos distintos, entre referências textuais geocodificadas com roteamento OSRM de automóvel. Não são shapes oficiais e podem omitir ruas/variantes; não servem como orientação exata de embarque. L6: geometria única antiga removida porque há variantes Via BR e Via Vila Romão; faltam geometrias próprias. L8/rurais/universitários: ainda sem shape. A sequência textual completa da fonte é preservada independentemente da geometria parcial.

## Locais e imagens
Três registros conferidos na API pública OpenStreetMap: nodes 6917189485, 5454700591 e 5454700576. Apenas Rodoviária de Registro tem nome na base. São locais mapeados sem validação atual da operadora. **Não representam o cadastro completo de paradas**, nem comprovam atendimento pela linha selecionada. lineIds vazio. Coordenadas e fontes acessíveis. Distância em linha reta calculada no dispositivo. Não há foto local verificada; links externos Google Street View procuram o entorno, sem garantia de imagem, data ou correspondência à parada. Nenhuma imagem gerada é usada como foto de um local real.

## Tempo real e localização
Apenas localização do usuário, após botão e permissão: watchPosition, precisão, atualização de marcador, recenter, cancelamento e pausa quando oculto. Coordenadas somente em memória; não persistidas ou enviadas a backend próprio. Tiles do provedor podem revelar área visualizada. Não há feed de GPS dos ônibus, posições simuladas, previsão de chegada ou rastreamento em segundo plano garantido. Há indicação separada do estado da posição do usuário e da ausência de GPS da frota. A grade é estática, não sincronizada automaticamente com a fonte.

## Offline e execução
Servir dist/ em HTTPS (localhost para desenvolvimento), sem build. Shell e dados em cache com network-first; tiles externos e Street View precisam de internet. Instalação depende do navegador.

## Testes
Sintaxe app.js/sw.js; integridade de 15 entradas, horários, variantes, incertezas e dados de locais. Testes DOM/mapa/GPS simulados para busca, favoritos, sentido/dia, L5 domingo, L6 variantes/nota IFSP, L9 conflito, R6 dias específicos, U52, 3 locais, distância, geolocalização e erros. Sem QA em navegador real ou GPS físico neste ambiente.

## Dependências para produção completa
Cadastro homologado parada/linha/sentido/sequência, shapes oficiais, fotos com origem/licença verificadas e vigência operacional das grades. Tempo real dos ônibus requer API/GTFS-RT ou integração autorizada com GPS da operadora. Uma futura API Node.js/NestJS e banco geográfico podem centralizar publicação/validação/feeds; não estão implementados nesta versão.

## v5 — sequências por destino e referências recuperadas
Recuperados os marcadores numerados de referência com uma lista vinculada por linha, sentido e variante. journeys.json contém 42 sequências para todos os 15 grupos de destino (11 regulares + 4 universitários). São 404 ocorrências de referências ao longo dessas sequências (com repetições entre sentidos/variantes); 301 ocorrências receberam localização aproximada e 103 permanecem sem coordenada, visíveis na ordem publicada. Esses números NÃO são um inventário de 404 paradas físicas e NÃO significam paradas de embarque homologadas.
A numeração permanece estável na busca. Referências com a mesma coordenada compartilham um marcador com todos os números. Clicar em Ver no mapa abre a referência correspondente. Listagem global permite abrir cada sequência. Variantes sem shape não usam a geometria do percurso principal nem polilinhas inventadas. Dados incompletos L6/R6/universitários identificados como sequências parciais.
Georreferenciamento por correspondências nominalmente verificadas com índice OSM local e cache de referências previamente conferido; ruas/bairros são aproximados, não calçada/poste de embarque. IFSP e Faculdade usam referências de campus (não paradas). boardingValidated=false em todas as referências. Três locais OSM permanecem em seção separada, sem associação de linhas.
Consulta adicional às fontes públicas não localizou o cadastro completo de paradas/linha/sentido. Para concluir a validação operacional são necessários stops e stop_times GTFS, cadastro equivalente da operadora/município ou levantamento em campo autorizado.
Novos testes simulados: listas e marcadores vinculados, todas as direções, variantes especiais, 42 seletores globais, numeração fixa na busca, sequência parcial e ausência de marcador para coordenada pendente. Sem QA visual em navegador real.
Reprodução: build_journeys.py usa reference-geocoding-index.json retido no repositório e geocoding.json; não depende do scratch.

## GitHub e Vercel
Export preparado sem credenciais, arquivos internos de hospedagem ou histórico Git da publicação anterior. Produção estática: os comandos Node validam arquivos e dados; não há backend/API.

- `npm run build`: valida a publicação; saída em dist/.
- Desenvolvimento local: `python -m http.server 3000 --directory dist` e abrir http://localhost:3000.
- Vercel: Framework Other; Output Directory dist; Build npm run build; Install sem comando. vercel.json contém a configuração.
- Branch proposta para produção: main, quando o repositório GitHub estiver conectado.

### Dados de terceiros
Leaflet mantém seu aviso de copyright no arquivo distribuído (BSD-2-Clause). Dados OpenStreetMap estão sujeitos à ODbL e atribuição; fontes ficam nos registros e no mapa. Horários e itinerários são informações públicas cuja vigência deve ser confirmada. Esta publicação não define licença geral para dados de terceiros.
