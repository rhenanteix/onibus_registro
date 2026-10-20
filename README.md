# Mobilidade Registro — Next.js / React

Portal independente de transporte de Registro (SP). Reestruturação completa da versão estática: componentes React, TypeScript, Next.js App Router e backend Node.js de leitura. Nome provisório preservado; “Bora Ribeira” não foi adotado sem escolha do mantenedor.

## Executar

Requisitos: Node.js 22.18+ e npm. Com o arquivo de lock distribuído:

```bash
npm ci
npm run dev
```

Abra http://localhost:3000. Produção:

```bash
npm test
npm run typecheck
npm run build
npm start
```

Não abra arquivos TSX ou HTML diretamente pelo Finder. O servidor Next.js é necessário inclusive para as APIs.

## Publicar no GitHub e Vercel

1. Extraia este pacote. Crie um repositório e envie seu CONTEÚDO, mantendo as pastas. Não envie apenas o ZIP.
2. `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json` e `vercel.json` devem estar na raiz junto de `src/` e `public/`.
3. Importe na Vercel usando preset **Next.js**, Root Directory na pasta de `package.json`, Install `npm ci`, Build `npm run build`.
4. Remova o override antigo de Output Directory `dist`. Deixe o padrão do Next.js (sem override). Este projeto NÃO usa dist e NÃO é exportação estática.
5. Remova configurações antigas do projeto estático caso esteja substituindo o mesmo repositório. Não misture `app.js` antigo com o novo `src/`.
6. Não há variáveis de ambiente obrigatórias, banco ou chave privada nesta versão.

Se preferir Git local:

```bash
git init
git add .
git commit -m "Reestrutura portal em Next.js"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
git push -u origin main
```

## Stack e backend

- React 19, Next.js 16, TypeScript estrito.
- Leaflet e React Leaflet, carregados apenas no cliente com importação dinâmica.
- CSS próprio, responsivo, sem template de landing page.
- Lucide para ícones de interface; não há logo de operadora.
- Route Handlers Node.js: `/api/catalog`, `/api/lines/[id]`, `/api/realtime`.
- Repositório de dados no servidor: `src/server/transit-repository.ts`. Atualmente lê JSON versionado. Não há NestJS separado, banco, autenticação ou endpoint administrativo de gravação.
- O Server Component da página inicial acessa o repositório diretamente; o botão atualizar consulta a API. O mesmo catálogo alimenta o cache offline.

## Funcionalidades implementadas

Busca por linha, destino, bairro ou referência; filtros; favoritos no dispositivo; ida/volta; seleção de 42 percursos; horários por dia; próxima saída publicada na origem usando fuso São Paulo; referências numeradas vinculadas ao mapa; traçados aproximados tracejados; localização do usuário e círculo de precisão; botão para recentralizar; pausa da localização quando a aba fica oculta; controle para parar; link externo para entorno; consulta de fonte e texto original; página `/projeto` com melhorias e arquitetura; instalação assistida; consulta offline simplificada da última base salva.

O buscador encontra linhas que mencionam um destino. NÃO calcula planejamento porta a porta, conexões, caminhada, duração ou tarifa. Horário de saída NÃO é previsão de passagem pelo ponto. A seleção de variante não infere uma associação que não existe entre horário e geometria: notas e variantes de cada saída são preservadas.

## Instalação PWA

A instalação automática e silenciosa não é permitida pelos navegadores. O convite é apresentado e o usuário confirma. `beforeinstallprompt` é usado onde disponível. No iPhone, a interface orienta Compartilhar → Adicionar à Tela de Início. Dentro de navegadores de redes sociais pode ser necessário abrir no navegador do dispositivo. HTTPS é necessário em produção; localhost é aceito para desenvolvimento.

Manifest e ícones em `public/`. O service worker é registrado após a hidratação. O usuário pode dispensar o convite por sete dias e reabri-lo pelo botão fixo. O cache da versão anterior do projeto é substituído. Favoritos e preferência de instalação ficam no localStorage; coordenadas não são persistidas nem enviadas à API.

Offline: abre `/offline.html`, com consulta por linha de horários e referências, a partir do último catálogo salvo. A primeira visita deve ser online. Não se promete o mapa ou toda a interface React em modo offline; tiles e imagens externas exigem internet. O cache deve ser invalidado quando o formato dos dados mudar. GPS da frota não existe.

## Integridade e fontes

Base documental de 20/10/2026: material público fornecido e https://registro.sp.gov.br/horarios-de-onibus/ . Foram preservados os arquivos da versão anterior:

- 15 grupos de linhas, 42 sequências e 499 registros de saídas (com duplicidades e incertezas da fonte).
- 404 ocorrências de referências, com repetições: 301 geolocalizadas aproximadamente e 103 sem coordenada.
- Esses números não representam inventário de paradas físicas. Todas as referências têm `boardingValidated: false`.
- Cinco shapes inferidos (L3/L4/L5/L7/L9), em dois sentidos, com roteamento de automóvel entre referências. Não são percursos oficiais de ônibus. Variantes especiais não reutilizam o shape principal.
- Três locais OSM sem vínculo confirmado com linhas. Não são mostrados como pontos de embarque da linha selecionada.
- L6 sem geometria porque as variantes não foram validadas. R6 somente terça/quarta/sexta. Feriados são seleção manual.
- A grade não é sincronizada automaticamente com a fonte. O botão atualizar consulta a API do projeto, não o site da operadora.
- Link “Ver entorno” procura imagens num serviço externo e não comprova o ponto de embarque nem garante disponibilidade de fotos.

## Organização do código

Veja `docs/ARQUITETURA.md` para o papel de cada componente, contrato das APIs e próximos módulos. `docs/EVOLUCAO.md` detalha a priorização e critérios de aceite. A mesma descrição funcional está disponível na página `/projeto`.

## Licenças

Código original: MIT, em LICENSE. Dados de terceiros não são relicenciados pela licença do código. Consulte THIRD_PARTY.md e as fontes por registro. Não existe vínculo oficial com a operadora nem autorização presumida para acessar GPS ou bilhetagem.
