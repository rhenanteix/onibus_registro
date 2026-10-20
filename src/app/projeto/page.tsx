import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Radio,
  Database,
  Code2,
  MapPin,
  Smartphone,
  ArrowRight,
} from "lucide-react";
export const metadata = { title: "Projeto, melhorias e arquitetura" };
const delivered = [
  [
    "Uma interface de viagem",
    "Busca por destino, filtros por tipo, favoritos locais, sentidos, variantes, sequência numerada e mapa vinculado.",
  ],
  [
    "Código React organizado",
    "Next.js App Router, TypeScript, componentes por domínio, hooks reutilizáveis e regras de horário isoladas.",
  ],
  [
    "Instalação assistida",
    "Manifest, ícones, service worker e convite de instalação. Android usa o recurso do navegador quando disponível; iPhone recebe instruções.",
  ],
  [
    "Backend Node.js funcional",
    "APIs de leitura para catálogo, linha e disponibilidade do tempo real. A fonte atual são arquivos versionados.",
  ],
  [
    "Transparência dos dados",
    "Textos e fontes preservados, horários incertos sinalizados, referências aproximadas e ausência de GPS explícitas.",
  ],
  [
    "Documentação pública",
    "Referência da API em OpenAPI, índice de documentação, roadmap e changelog gerados a partir dos arquivos versionados do projeto.",
  ],
];
const roadmap = [
  [
    "01",
    "Dados confiáveis",
    "Validar paradas, coordenadas de embarque, sentidos, variantes, calendários e vigência com a operadora. Importar GTFS ou cadastro equivalente.",
    "Operadora / município",
  ],
  [
    "02",
    "Planejar de porta a porta",
    "Busca de endereços, caminhada até o embarque, conexões e escolha da melhor viagem. O buscador atual encontra linhas por referência, não calcula viagens.",
    "Cadastro homologado e roteamento",
  ],
  [
    "03",
    "Administração",
    "Login de editores, perfis, revisão, publicação, auditoria, vigência e histórico. PostgreSQL/PostGIS substitui os arquivos no repositório de dados.",
    "Autenticação e banco de dados",
  ],
  [
    "04",
    "Ônibus em tempo real",
    "Integrar GPS ou GTFS-RT, identificar veículo/viagem, mostrar atraso da última posição e retirar dados vencidos. Só depois estimar chegada.",
    "API autorizada da frota",
  ],
  [
    "05",
    "Fotos e acessibilidade",
    "Fotos reais autorizadas, lado da rua, abrigo, iluminação e acessibilidade; contribuições com moderação.",
    "Levantamento e armazenamento de imagens",
  ],
  [
    "06",
    "Créditos e serviços",
    "Consultar saldo, recarregar e acompanhar pedidos com conciliação e comprovantes. Nunca confirmar crédito apenas pelo pagamento.",
    "Contrato e API de bilhetagem",
  ],
];
export default function Project() {
  return (
    <main id="conteudo" className="project-page">
      <Link className="back-link" href="/">
        <ArrowLeft size={16} /> Voltar ao mapa
      </Link>
      <div className="project-intro">
        <span className="eyebrow">PROJETO ABERTO · VERSÃO 1.0</span>
        <h1>
          Um caminho mais claro
          <br />
          para usar o transporte.
        </h1>
        <p>
          Uma base de mobilidade para Registro, construída para evoluir com quem
          conhece a cidade. Esta página explica o que funciona, o que depende de
          dados oficiais e onde entra o backend.
        </p>
      </div>
      <div className="project-stats">
        <div>
          <strong>15</strong>
          <span>grupos de linhas</span>
        </div>
        <div>
          <strong>42</strong>
          <span>sequências de percurso</span>
        </div>
        <div>
          <strong>499</strong>
          <span>registros de saídas publicadas*</span>
        </div>
        <div>
          <strong>0</strong>
          <span>integrações com GPS da frota</span>
        </div>
      </div>
      <p className="muted">
        * Inclui repetições, variantes e pendências da fonte. Não corresponde a
        499 viagens operacionais confirmadas. As 404 ocorrências de referências
        não são 404 pontos físicos de embarque.
      </p>
      <section>
        <h2>
          <CheckCircle2 /> O que esta versão entrega
        </h2>
        <div className="feature-grid">
          {delivered.map(([title, body]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
      <section>
        <h2>
          <MapPin /> Como a experiência mudou
        </h2>
        <p>
          O usuário busca o bairro ou destino, escolhe a linha, identifica de
          onde sai e para onde vai, consulta o dia e acompanha as referências na
          ordem. No celular, alterna entre percurso e mapa. Não precisa criar
          conta para consultar informações ou salvar favoritos no dispositivo.
        </p>
        <p>
          Linhas contínuas na interface representam a sequência de leitura;
          traçados no mapa são tracejados e aproximados. Referências sem
          coordenadas continuam na lista, sem inventar marcadores ou ruas. O
          serviço externo de imagens do entorno não garante foto do ponto.
        </p>
      </section>
      <section>
        <h2>
          <Database /> Onde entra o backend?
        </h2>
        <div className="architecture">
          <div>
            <Code2 />
            <strong>React / Next.js</strong>
            <p>Interface, mapa, favoritos, geolocalização e instalação.</p>
          </div>
          <ArrowRight />
          <div>
            <Database />
            <strong>API em Node.js</strong>
            <p>
              Route Handlers no mesmo projeto. Repositório de dados centralizado
              no servidor.
            </p>
          </div>
          <ArrowRight />
          <div>
            <Radio />
            <strong>Dados e integrações</strong>
            <p>
              Hoje: JSON versionado. Próximo: PostgreSQL/PostGIS, GTFS e GPS
              autorizado.
            </p>
          </div>
        </div>
        <div className="api-table">
          <code>GET /api/catalog</code>
          <span>Catálogo completo e metadados da base.</span>
          <code>GET /api/lines/L3</code>
          <span>Linha, horários, percursos e geometria.</span>
          <code>GET /api/realtime</code>
          <span>Informa indisponibilidade; não simula veículos.</span>
          <code>GET /api/openapi</code>
          <span>Especificação OpenAPI da própria API.</span>
        </div>
        <p>
          Já existe backend Node.js de leitura. Não existe NestJS separado,
          banco persistente, login administrativo ou sistema de recarga nesta
          entrega. Esses módulos entram quando houver necessidade operacional e
          acesso aos dados, sem refazer os componentes do mapa.
        </p>
      </section>
      <section>
        <h2>
          <Smartphone /> Instalação e uso offline
        </h2>
        <p>
          A instalação exige confirmação do usuário. O convite aparece
          automaticamente, mas instalar silenciosamente não é permitido pelos
          navegadores. A disponibilidade do botão nativo depende do dispositivo.
          Ao fechar o convite, ele fica oculto por sete dias e pode ser reaberto
          pelo botão “Instalar app”.
        </p>
        <p>
          O service worker mantém uma página offline e armazena consultas do
          catálogo. A interface de consulta offline abre a última base
          consultada. O mapa, imagens externas e atualizações precisam de
          conexão. Uma base salva pode estar desatualizada e não fornece
          informação operacional em tempo real.
        </p>
      </section>
      <section>
        <h2>Próximas entregas, na ordem que faz sentido</h2>
        <div className="roadmap">
          {roadmap.map(([number, title, body, dependency]) => (
            <article key={number}>
              <span>{number}</span>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
                <small>Depende de: {dependency}</small>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section>
        <h2>Colaboração e privacidade</h2>
        <p>
          Projeto independente, sem vínculo oficial com a operadora. A posição
          do usuário fica na memória do navegador; favoritos ficam neste
          dispositivo. Não usamos rastreamento de passageiros. O provedor do
          mapa recebe requisições de tiles da região visualizada.
        </p>
        <p>
          Para colaborar, use o guia CONTRIBUTING.md do código. A documentação
          pública, com a referência da API e o histórico de versões, está em{" "}
          <Link href="/docs">/docs</Link>. As sugestões de nome ainda não foram
          adotadas: a interface mantém “Mobilidade Registro”. A licença MIT
          cobre o código original; os dados e bibliotecas de terceiros mantêm
          suas condições e atribuições.
        </p>
      </section>
      <Link href="/" className="primary inline-button">
        Explorar o transporte <ArrowRight size={17} />
      </Link>
    </main>
  );
}
