# Publicar a versão Next.js

1. Extraia o ZIP.
2. Use um repositório novo ou uma branch de migração. Envie o conteúdo extraído preservando src/, public/, docs/, tests/ e tools/.
3. package.json, package-lock.json, tsconfig.json, next.config.ts e vercel.json devem ficar na raiz.
4. Na Vercel escolha Framework Next.js. Root Directory: pasta que contém package.json. Install: npm ci. Build: npm run build. Output Directory: padrão, SEM override dist.
5. Não precisa de variáveis de ambiente nesta versão.
6. Faça o deploy e teste no celular com HTTPS. O botão de instalação depende da confirmação e suporte do navegador.

A versão anterior era estática. Esta tem servidor Next.js/Node e APIs; não misture os arquivos antigos de dist com os componentes novos.

Execução local: npm ci, npm run dev, abrir http://localhost:3000.

Detalhes de UX/backend: página /projeto e pasta docs/. Código original sob MIT; dados de terceiros têm condições próprias em THIRD_PARTY.md.
