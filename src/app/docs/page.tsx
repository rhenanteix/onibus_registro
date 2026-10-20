import Link from "next/link";
import { ArrowUpRight, BookOpen, History, Terminal } from "lucide-react";

export const metadata = { title: "Documentação" };

const cards = [
  {
    href: "/docs/api",
    icon: Terminal,
    title: "Documentação da API",
    text: "Referência dos endpoints de leitura, gerada a partir do OpenAPI que o próprio projeto publica.",
  },
  {
    href: "/roadmap",
    icon: History,
    title: "Roadmap, versões e melhorias",
    text: "O que já foi entregue, o que está em aberto e o histórico de mudanças do projeto.",
  },
  {
    href: "/projeto",
    icon: BookOpen,
    title: "Sobre o projeto",
    text: "Arquitetura, origem dos dados, limitações de verificação e próximos passos.",
  },
];

export default function DocsPage() {
  return (
    <main id="conteudo" className="project-page">
      <div className="project-intro">
        <span className="eyebrow">DOCUMENTAÇÃO</span>
        <h1>Documentação do projeto</h1>
        <p>
          O portal serve dados de horário e percurso publicados pela prefeitura.
          Esta seção reúne a referência da API, o histórico de versões e a
          descrição do projeto, todos abertos para revisão externa.
        </p>
      </div>
      <div className="docs-cards">
        {cards.map(({ href, icon: Icon, title, text }) => (
          <Link key={href} href={href} className="docs-card">
            <Icon size={20} />
            <h2>{title}</h2>
            <p>{text}</p>
            <span className="docs-card-link">
              Abrir <ArrowUpRight size={14} />
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
