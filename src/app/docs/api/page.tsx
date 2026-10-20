"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";

type Status = "idle" | "loading" | "ready" | "error";

const REDOC_URL =
  "https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js";

export default function ApiDocsPage() {
  const [status, setStatus] = useState<Status>("idle");

  // O visualizador Redoc vem de um CDN externo. Ele só é buscado depois que
  // a pessoa pede, para que nenhuma requisição a terceiros aconteça ao
  // carregar a página. A especificação em /api/openapi é do próprio projeto.
  function load() {
    if (status === "loading" || status === "ready") return;
    setStatus("loading");
    const script = document.createElement("script");
    script.src = REDOC_URL;
    script.async = true;
    script.onload = () => {
      if ((window as any).Redoc) {
        (window as any).Redoc.init(
          "/api/openapi",
          {
            hideDownloadButton: false,
            theme: { colors: { primary: { main: "#0f172a" } } },
          },
          document.getElementById("redoc"),
        );
        setStatus("ready");
      } else {
        setStatus("error");
      }
    };
    script.onerror = () => setStatus("error");
    document.body.appendChild(script);
  }

  return (
    <main id="conteudo" className="api-docs">
      <Link className="back-link api-docs-back" href="/docs">
        <ArrowLeft size={16} /> Documentação
      </Link>
      <div id="redoc" />
      {status === "idle" && (
        <div className="api-docs-note" role="status">
          <p>
            A referência visual é carregada por um CDN externo, por isso só
            aparece depois do clique abaixo. Nenhuma requisição a terceiros é
            feita ao abrir esta página.
          </p>
          <button className="primary" onClick={load}>
            <Download size={16} /> Carregar referência visual
          </button>
          <p>
            O arquivo <a href="/api/openapi">/api/openapi</a> continua acessível
            sem nenhuma requisição externa, no formato OpenAPI.
          </p>
        </div>
      )}
      {status === "loading" && (
        <p className="api-docs-note" role="status">
          Carregando a referência da API…
        </p>
      )}
      {status === "error" && (
        <p className="api-docs-note" role="status">
          A referência visual é carregada por um CDN externo e não está
          disponível agora. O arquivo <a href="/api/openapi">/api/openapi</a>{" "}
          continua acessível, no formato OpenAPI.
        </p>
      )}
    </main>
  );
}
