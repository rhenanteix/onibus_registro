# Mobilidade Registro — Next.js / React

Portal independente de transporte de Registro (SP). Reestruturação completa da versão estática: componentes React, TypeScript, Next.js App Router e backend Node.js de leitura.

Site publicado: https://onibusregistro-yeal.vercel.app/

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
- Route Handlers Node.js: `/api/catalog`, `/api/lines/[id]`, `/api/realtime`. A especificação OpenAPI fica em `/api/openapi`.
- Repositório de dados no servidor: `src/server/transit-repository.ts`. Atualmente lê JSON versionado. Não há NestJS separado, banco, autenticação ou endpoint administrativo de gravação.
- O Server Component da página inicial acessa o repositório diretamente; o botão atualizar consulta a API. O mesmo catálogo alimenta o cache offline.

## Funcionalidades implementadas

Busca por linha, destino, bairro ou referência; filtros; favoritos no dispositivo; ida/volta; seleção de 42 percursos; horários por dia; próxima saída publicada na origem usando fuso São Paulo; referências numeradas vinculadas ao mapa; situação de localização de cada referência (confirmada, aproximada ou sem localização); traçados aproximados tracejados; localização do usuário e círculo de precisão; botão para recentralizar; pausa da localização quando a aba fica oculta; controle para parar; link externo para entorno, aberto só por ação do usuário; consulta de fonte e texto original; calendário de feriados com aplicação automática da grade de domingo/feriado e seleção manual disponível; páginas `/projeto`, `/docs`, `/docs/api`, `/roadmap` e `/licenca`; instalação assistida; consulta offline simplificada da última base salva.

O buscador encontra linhas que mencionam um destino. NÃO calcula planejamento porta a porta, conexões, caminhada, duração ou tarifa. Horário de saída NÃO é previsão de passagem pelo ponto. A seleção de variante não infere uma associação que não existe entre horário e geometria: notas e variantes de cada saída são preservadas.

## Instalação PWA

A instalação automática e silenciosa não é permitida pelos navegadores. O convite é apresentado e o usuário confirma. `beforeinstallprompt` é usado onde disponível. No iPhone, a interface orienta Compartilhar → Adicionar à Tela de Início. Dentro de navegadores de redes sociais pode ser necessário abrir no navegador do dispositivo. HTTPS é necessário em produção; localhost é aceito para desenvolvimento.

Manifest e ícones em `public/`. O service worker é registrado após a hidratação. O usuário pode dispensar o convite por sete dias e reabri-lo pelo botão fixo. O cache da versão anterior do projeto é substituído. Favoritos e preferência de instalação ficam no localStorage; coordenadas não são persistidas nem enviadas à API.

Offline: abre `/offline.html`, com consulta por linha de horários e referências, a partir do último catálogo salvo. A primeira visita deve ser online. Não se promete o mapa ou toda a interface React em modo offline; tiles e imagens externas exigem internet. O cache deve ser invalidado quando o formato dos dados mudar. GPS da frota não existe.

## Integridade e fontes

Base documental de 20/10/2026: material público fornecido e https://registro.sp.gov.br/horarios-de-onibus/ . Foram preservados os arquivos da versão anterior:

- 15 grupos de linhas, 42 sequências e 499 registros de saídas (com duplicidades e incertezas da fonte).
- 404 ocorrências de referências, com repetições: 301 com localização aproximada, 103 sem coordenada e 0 confirmadas. O campo `locationStatus` diz isso em cada referência; o relatório está em `docs/REFERENCIAS.md`.
- Esses números não representam inventário de paradas físicas. Todas as referências têm `boardingValidated: false`.
- Cinco shapes inferidos (L3/L4/L5/L7/L9), em dois sentidos, com roteamento de automóvel entre referências. Não são percursos oficiais de ônibus. Variantes especiais não reutilizam o shape principal.
- Três locais OSM sem vínculo confirmado com linhas. Não são mostrados como pontos de embarque da linha selecionada.
- L6 sem geometria porque as variantes não foram validadas. R6 somente terça/quarta/sexta.
- Feriados são detectados pelo calendário de `src/data/feriados.json`, com fonte oficial em cada data, e a grade de domingo/feriado é aplicada sozinha. A seleção manual continua disponível. Detalhes em `docs/FERIADOS.md`.
- A grade não é sincronizada automaticamente com a fonte. O botão atualizar consulta a API do projeto, não o site da operadora.
- Link “Ver entorno” procura imagens num serviço externo (Google Maps) e não comprova o ponto de embarque nem garante disponibilidade de fotos. Ele só é acessado por clique, e o portal não carrega imagem ou script de terceiros sem ação do usuário.

## Testes

`npm test` executa todos os arquivos `tests/*.test.ts` com o runner nativo do Node (`node --test`), sem dependência externa. A cobertura atual:

- `tests/domain.test.ts`: regras de horário, próxima saída, busca e integridade dos dados versionados.
- `tests/feriados.test.ts`: schema do calendário de feriados, fonte oficial de cada data e aplicação da grade de domingo/feriado.
- `tests/referencias.test.ts`: situação de localização de cada referência, coerência do campo e ausência de coordenada inventada.
- `tests/privacidade.test.ts`: nenhuma requisição a terceiros ao carregar a página, exceto os tiles do mapa.
- `tests/markdown.test.ts`: renderização dos arquivos markdown usados em `/roadmap` (hierarquia de títulos, HTML bruto descartado, endereços filtrados).
- `tests/styles.test.ts`: toda classe usada no JSX precisa existir em `src/app/globals.css` e toda rota precisa de destino para o link de salto do cabeçalho.
- `tests/openapi.test.ts`: a especificação OpenAPI aponta para o site publicado, não promete dado de frota em tempo real e usa IDs de linha que existem na base.

O projeto não usa Tailwind nem outra biblioteca de classes utilitárias: o estilo vem de `src/app/globals.css`, e o teste de estilo falha se uma classe nova for usada sem a regra correspondente.

O relatório das referências é reproduzível: `npm run report:referencias` imprime a contagem por linha e por situação; `npm run report:referencias:check` falha se o campo `locationStatus` divergir dos dados brutos.

## Organização do código

Veja `docs/ARQUITETURA.md` para o papel de cada componente, contrato das APIs e próximos módulos. `docs/EVOLUCAO.md` detalha a priorização e critérios de aceite. `docs/FERIADOS.md` explica como adicionar ou atualizar feriados, com as fontes usadas. `docs/REFERENCIAS.md` é o relatório gerado das referências sem coordenadas. A mesma descrição funcional está disponível na página `/projeto`.

## Licenças

Código original: MIT, em LICENSE. Dados de terceiros não são relicenciados pela licença do código. Consulte THIRD_PARTY.md e as fontes por registro. Não existe vínculo oficial com a operadora nem autorização presumida para acessar GPS ou bilhetagem.

A base legal dos dados (fonte, data de coleta, natureza pública, aviso de independência e licença sugerida) está em `DATA_LICENSE.md`, renderizado na página `/licenca`. A minuta de ofício para pedir dados oficiais ou autorização à prefeitura está em `docs/MINUTA-OFICIO.md`. Nenhum desses textos é parecer jurídico: a revisão final cabe aos mantenedores.

### Experiência de consulta e descoberta

A página inicial apresenta busca por linha/bairro, sentido, horários e referências
em texto. O mapa e seus tiles externos são carregados na tela principal;
a localização do aparelho não representa a posição de um ônibus. Não há integração
com GPS da frota. A instalação do aplicativo é oferecida sob demanda.

A identidade pública usa `NEXT_PUBLIC_SITE_URL` (padrão: endereço de produção acima)
para metadados, URL canônica, `robots.txt` e `sitemap.xml`. Ao trocar o domínio,
atualize essa variável antes do build. A imagem de compartilhamento é gerada em
`/opengraph-image`, sem imagens ou fontes remotas. O guia visível e o JSON-LD
explicam o escopo real do serviço; não garantem indexação nem citação por IA.

Verificação manual recomendada: busca sem resultados, favoritos, seleção de linha,
inversão do sentido, escolha do dia, abertura do mapa, localização permitida/negada,
navegação por teclado e zoom. A grade de horários continua disponível em texto.

### Localização e lembrete de saída

A ação destacada de localização sugere uma linha pela referência geográfica mais
próxima (até 2 km, com precisão do aparelho de até 1 km). A sugestão acontece uma
vez por ativação; uma escolha manual não é substituída a cada atualização do GPS.
Distância em linha reta não comprova embarque, direção desejada ou caminho a pé.
A posição não é enviada ao servidor nem persistida pelo recurso de sugestões.

O lembrete é ativado separadamente por clique, para a próxima saída publicada de
hoje. Solicita permissão de notificação e usa o service worker quando autorizado;
caso contrário, exibe o aviso na página. O lembrete fica em `sessionStorage` nessa
aba, pode ser cancelado e é consumido uma vez na janela de 10 minutos antes da
saída. Horários já passados não disparam ao retornar à página. O horário é o da
origem, não uma previsão de chegada ao ponto.

**Limite atual:** o agendamento depende da página aberta e ativa. Não há serviço
Web Push nem agendador no servidor; celular bloqueado, aba suspensa e site fechado
não têm entrega garantida. Para esse cenário é necessário integrar persistência
de inscrições Push, chaves VAPID e envio agendado no servidor. A permissão do
navegador, por si só, não fornece agendamento em segundo plano.
