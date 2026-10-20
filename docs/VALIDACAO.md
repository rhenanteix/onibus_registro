# Verificação da entrega

- Build de produção Next.js 16.4.2: aprovado.
- TypeScript estrito: aprovado.
- Cinquenta e um testes (domínio e integridade, markdown, estilo, especificação da API, feriados, referências e privacidade): aprovados.
- Sintaxe do service worker: aprovada.
- Build gerou /, /projeto, /docs, /docs/api, /licenca, /roadmap e as rotas de API.
- Relatório das referências conferido com `npm run report:referencias:check`: 404 ocorrências, 0 confirmadas, 301 aproximadas e 103 sem localização.
- Calendário de feriados validado por teste de schema: todas as datas têm escopo, tipo, status e fonte.
- Não foi executado teste HTTP de ponta a ponta ou revisão visual em navegador nesta entrega. Instalação, permissões GPS, uso offline e o carregamento sob demanda da referência da API precisam de homologação em Android e iPhone reais.
- A validação do software não confirma a operação de linhas, horários ou locais de embarque.
