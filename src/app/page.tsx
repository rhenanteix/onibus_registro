import { saoPauloDateKey } from "@/lib/domain";
import type { Metadata } from "next";
import { getCatalog } from "@/server/transit-repository";
import { MobilityPortal } from "@/components/mobility/MobilityPortal";
import { siteUrl, siteDescription } from "@/lib/site";
export const metadata: Metadata = { alternates: { canonical: "/" } };
export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Mobilidade Registro",
    url: siteUrl,
    description: siteDescription,
    inLanguage: "pt-BR",
    about: {
      "@type": "Thing",
      name: "Transporte público de ônibus em Registro, São Paulo",
    },
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <MobilityPortal
        initialCatalog={getCatalog()}
        initialDate={saoPauloDateKey()}
      />
    </>
  );
}
