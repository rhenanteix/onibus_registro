import fs from "fs";
import path from "path";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { renderMarkdown } from "@/lib/markdown";

export const metadata = { title: "Roadmap, versões e melhorias" };

export default function RoadmapPage() {
  const roadmap = fs.readFileSync(
    path.join(process.cwd(), "ROADMAP.md"),
    "utf8",
  );
  const changelog = fs.readFileSync(
    path.join(process.cwd(), "CHANGELOG.md"),
    "utf8",
  );
  return (
    <main id="conteudo" className="project-page">
      <Link className="back-link" href="/docs">
        <ArrowLeft size={16} /> Documentação
      </Link>
      <div className="project-intro">
        <span className="eyebrow">ROADMAP · VERSÕES</span>
        <h1>Roadmap, versões e melhorias</h1>
        <p>
          O que já foi entregue, o que continua em aberto e o que depende de
          informação que o projeto ainda não tem. O conteúdo vem dos arquivos
          ROADMAP.md e CHANGELOG.md versionados no repositório, na ordem em que
          estão no código.
        </p>
      </div>
      <section>
        <div
          className="markdown"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(roadmap) }}
        />
      </section>
      <section id="changelog">
        <div
          className="markdown"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(changelog) }}
        />
      </section>
    </main>
  );
}
