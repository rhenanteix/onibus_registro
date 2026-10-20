# Roadmap - Versões e Melhorias Planejadas

Este arquivo é renderizado na página /roadmap. Ele registra o que já foi
entregue e o que continua em aberto. A ordem de prioridade e as dependências
de cada item estão em /projeto e em docs/EVOLUCAO.md.

## Versão 1.0 - Portal Next.js com backend de leitura (entregue)
- [x] Portal em Next.js App Router com TypeScript estrito
- [x] Route Handlers de leitura: /api/catalog, /api/lines/{id}, /api/realtime
- [x] Catálogo servido a partir de arquivos JSON versionados
- [x] PWA com manifesto, service worker e consulta offline do catálogo
- [x] Páginas /projeto, /docs, /docs/api, /licenca e /roadmap
- [x] Documentação pública da API em OpenAPI, em /api/openapi
- [x] Testes de domínio, integridade dos dados, estilo, markdown, feriados, referências e privacidade

## Versão 1.1 - Feriados, referências e licença (entregue)
- [x] Calendário de feriados 2026-2027 com escopo, tipo, status e fonte oficial por data
- [x] Aplicação automática da grade de domingo e feriado, com seleção manual mantida
- [x] Aviso de feriado e de ponto facultativo na grade e no calendário navegável
- [x] Situação de localização por referência (confirmada, aproximada, sem localização) na timeline e no mapa
- [x] Relatório reproduzível das referências por linha e por situação, com verificação em CI
- [x] Base legal dos dados e minuta de ofício, com a página /licenca
- [x] Nenhuma requisição a terceiros sem ação do usuário, exceto os tiles do mapa

## Em aberto - API
- [ ] Paginação consistente
- [ ] Tratamento de erros padronizado
- [ ] Rate limiting
- [ ] Health check
- [ ] Versionamento da API
- [ ] Exportação CSV/JSON

## Em aberto - Autenticação e administração
- [ ] API Keys
- [ ] JWT
- [ ] Controle de permissões

## Em aberto - Dados e operação
- [ ] Homologar paradas e coordenadas de embarque com a operadora
- [ ] Importar GTFS ou cadastro equivalente
- [ ] Vigência de horários e atualização anual do calendário de feriados
- [ ] Fonte de dados versionada com histórico de publicação
- [ ] Confirmar com a prefeitura a licença de uso dos dados (ODbL ou CC BY 4.0)
- [ ] Confirmar com a operadora as condições de uso do link de entorno
