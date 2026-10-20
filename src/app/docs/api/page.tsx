"use client";

import { useEffect } from "react";

export default function ApiDocsPage() {
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
          document.getElementById("redoc")
        );
      }
    };
    document.body.appendChild(s);
  }, []);

  return (
    <div style={{ height: "100vh" }}>
      <div id="redoc" />
    </div>
  );
}
