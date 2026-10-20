# Como contribuir

Abra uma issue com reprodução, linha, sentido, dia e fonte. Não publique dados pessoais, cartões, credenciais ou posições de passageiros. Propostas de novos pontos devem incluir coordenada, lado da via, data e evidência; não alterar boardingValidated para true sem revisão operacional documentada.

Para código: faça um fork, uma branch e um pull request pequeno. Execute npm test, npm run typecheck e npm run build. Inclua impacto na acessibilidade e na experiência mobile. Nunca misture estimativas de percurso com pontos confirmados.

npm test executa todos os arquivos tests/*.test.ts com o runner nativo do Node. Ao alterar uma página, inclua o teste correspondente: o estilo vem de src/app/globals.css e o teste de estilo falha se uma classe do JSX não existir no CSS. Não introduza biblioteca de classes utilitárias sem decisão registrada.

O markdown público de /roadmap vem de ROADMAP.md e CHANGELOG.md, renderizados por src/lib/markdown.ts. Texto é preservado; HTML bruto e endereços não permitidos são descartados na renderização.

Os dados são mantidos em src/data. Os scripts em tools/import escrevem nessa pasta: execute em branch separada e revise o diff antes de publicar. Arquivos com fonte incerta não devem ter suas pendências removidas por suposição.

O calendário de feriados fica em src/data/feriados.json e é regido por src/lib/feriados.ts. Toda data nova precisa de escopo, tipo, status, base legal e fonte oficial; o procedimento está em docs/FERIADOS.md. O campo locationStatus das referências é conferido por npm run report:referencias:check, que falha se os dados brutos e o status gravado divergirem; atualize o relatório em docs/REFERENCIAS.md junto com os dados. Não preencha locationStatus como confirmada sem revisão operacional documentada.

Os dados de terceiros têm Requirements de licença e atribuição descritos em DATA_LICENSE.md, com a minuta de ofício em docs/MINUTA-OFICIO.md. Qualquer nova fonte, novo serviço externo ou novo arquivo de dados precisa ser registrada nesses documentos e em THIRD_PARTY.md. Mantenha o portal livre de requisições a terceiros sem ação do usuário, exceto os tiles do mapa.
