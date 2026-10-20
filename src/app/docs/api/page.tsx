"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Status = "loading" | "ready" | "error";

export default function ApiDocsPage() {
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js";
    s.async = true;
    s.onload = () => {
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
    s.onerror = () => setStatus("error");
    document.body.appendChild(s);
  }, []);

  return (
    <main id="conteudo" className="api-docs">
      <Link className="back-link api-docs-back" href="/docs">
        <ArrowLeft size={16} /> Documentação
      </Link>
      <div id="redoc" />
      {status !== "ready" && (
        <p className="api-docs-note" role="status">
          {status === "error" ? (
            <>
              A referência visual é carregada por um CDN externo e não está
              disponível agora. O arquivo{" "}
              <a href="/api/openapi">/api/openapi</a> continua acessível, no
              formato OpenAPI.
            </>
          ) : (
            "Carregando a referência da API…"
          )}
        </p>
      )}
    </main>
  );
}
