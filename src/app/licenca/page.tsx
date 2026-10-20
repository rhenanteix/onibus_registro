import fs from "fs";
import path from "path";
import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";
import { renderMarkdown } from "@/lib/markdown";

export const metadata = { title: "Licença e atribuição dos dados" };

export default function LicencaPage() {
  const license = fs.readFileSync(
    path.join(process.cwd(), "DATA_LICENSE.md"),
    "utf8",
  );
  const draft = fs.readFileSync(
    path.join(process.cwd(), "docs", "MINUTA-OFICIO.md"),
    "utf8",
  );
  return (
    <main id="conteudo" className="project-page">
      <Link className="back-link" href="/">
        <ArrowLeft size={16} /> Voltar ao mapa
      </Link>
      <div className="project-intro">
        <span className="eyebrow">LICENÇA E ATRIBUIÇÃO</span>
        <h1>De onde vêm os dados e como podem ser usados</h1>
        <p>
          O portal republica horário e itinerário publicados pela Prefeitura de
          Registro. Esta página reúne a base legal proposta, a atribuição
          exigida e a minuta de ofício preparada para pedir dados oficiais ou
          autorização. O texto não é parecer jurídico: a decisão final é dos
          mantenedores.
        </p>
      </div>
      <section>
        <h2>
          <Scale /> Licença dos dados
        </h2>
        <div
          className="markdown"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(license) }}
        />
      </section>
      <section id="minuta">
        <h2>Minuta de ofício</h2>
        <p className="muted">
          Minuta redigida para revisão antes do envio. O documento não foi
          protocolado.
        </p>
        <div
          className="markdown"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(draft) }}
        />
      </section>
    </main>
  );
}
