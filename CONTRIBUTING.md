# Como contribuir

Abra uma issue com reprodução, linha, sentido, dia e fonte. Não publique dados pessoais, cartões, credenciais ou posições de passageiros. Propostas de novos pontos devem incluir coordenada, lado da via, data e evidência; não alterar boardingValidated para true sem revisão operacional documentada.

Para código: faça um fork, uma branch e um pull request pequeno. Execute npm test, npm run typecheck e npm run build. Inclua impacto na acessibilidade e na experiência mobile. Nunca misture estimativas de percurso com pontos confirmados.

npm test executa todos os arquivos tests/*.test.ts com o runner nativo do Node. Ao alterar uma página, inclua o teste correspondente: o estilo vem de src/app/globals.css e o teste de estilo falha se uma classe do JSX não existir no CSS. Não introduza biblioteca de classes utilitárias sem decisão registrada.

O markdown público de /roadmap vem de ROADMAP.md e CHANGELOG.md, renderizados por src/lib/markdown.ts. Texto é preservado; HTML bruto e endereços não permitidos são descartados na renderização.

Os dados são mantidos em src/data. Os scripts em tools/import escrevem nessa pasta: execute em branch separada e revise o diff antes de publicar. Arquivos com fonte incerta não devem ter suas pendências removidas por suposição.
