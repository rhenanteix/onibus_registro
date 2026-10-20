# Como publicar manualmente

1. Extraia este ZIP no computador.
2. Crie um repositório público chamado registro-mobilidade no seu GitHub.
3. Em Upload files, envie o CONTEÚDO da pasta extraída: dist/, scripts/, README.md, package.json, vercel.json e os demais arquivos. Não envie apenas o ZIP. package.json e vercel.json devem ficar na raiz do repositório.
4. Preserve as pastas dist/ e scripts/. No macOS, arquivos iniciados por ponto podem estar ocultos; inclua .gitignore caso use Git local.
5. Confirme o commit na branch main.
6. Na Vercel, importe esse repositório. Framework: Other. Build Command: npm run build. Output Directory: dist. O vercel.json já fornece a configuração. Não são necessárias variáveis de ambiente.

Para testar localmente (Node.js 20+ e Python 3):

    npm run build
    python3 -m http.server 3000 --directory dist

Abra http://localhost:3000. Use um servidor HTTP, não abra index.html diretamente pelo Finder.

Este pacote contém a implementação atual completa. Frontend HTML/CSS/JavaScript, Leaflet e PWA; Node.js somente para validação. Não existe backend Node/NestJS ou rastreamento GPS da frota nesta versão. A localização do usuário depende de permissão. Percursos e referências aproximadas têm pendências detalhadas no README; não constituem cadastro homologado de todas as paradas.
