# Changelog

## [Unreleased]
- Corrigido "Consulte a grade" na primeira consulta da L3 (útil): o portal inicializava o relógio sem horário (cliente) e sem hora local (servidor), então `next` ficava null até o efeito de 30 segundos. O relógio de referência agora inicializa em America/Sao_Paulo no primeiro render, inclusive no servidor; após a última publicação do dia não há próxima saída e continuar mostrando a grade está correto (testes em tests/time.test.ts).
- Adicionado parseSourceTime em src/lib/domain.ts, função única de parsing de horários da fonte (06h55, 20:10, 11h:55, 07h50?, 07h55 (extra), 07h30 (Direto) ...). O texto original fica em raw e as marcações (?, extra, direto, via ...) se separam em note/uncertain; horário normalizado em time (HH:MM). Testes unitários cobrem todos os formatos reais encontrados nos dados.
- Adicionado campo opcional raw em Departure.
- Adicionado página de documentação da API
- Adicionado página de roadmap e melhorias
- Adicionado páginas /docs e /roadmap
- Corrigido o estilo de /docs e /roadmap, que usavam classes de utilitário inexistentes e eram exibidas sem formatação
- Adicionado link "Documentação" no cabeçalho e destino de salto de teclado em todas as rotas
- Adicionado renderizador de markdown próprio, com títulos rebaixados um nível, HTML bruto descartado e endereços externos filtrados
- Adicionado testes de estilo (toda classe usada no JSX existe no CSS) e de renderização de markdown
- Removido className sem regra correspondente em src/components/mobility/Timetable.tsx
- Corrigido a especificação OpenAPI: servidor de produção, versão, descrição e exemplos de ID de linha

## [0.1.0] - 2025-10-20
- Lançamento inicial
