import { saoPauloDateKey } from "@/lib/domain";
import type { Metadata } from "next";
import { getCatalog } from "@/server/transit-repository";
import { MobilityPortal } from "@/components/mobility/MobilityPortal";
import { siteUrl, siteDescription } from "@/lib/site";
export const metadata: Metadata = { alternates: { canonical: "/" } };
const questions = [
  [
    "Como encontrar meu ônibus?",
    "Digite o nome do bairro, destino ou número da linha na busca. Escolha uma linha para conferir o local de saída, o sentido da viagem e os horários. Use a estrela para guardar suas favoritas neste aparelho.",
  ],
  [
    "Consigo ver onde o ônibus está agora?",
    "Ainda não. O Mobilidade Registro não recebe GPS da frota. O mapa apresenta referências do percurso, e os horários são saídas publicadas na origem, não previsões de chegada ao seu ponto.",
  ],
  [
    "Como saber onde eu estou?",
    "Toque em Usar minha localização e permita o acesso no navegador. Depois abra o mapa e use Centralizar minha localização. A localização do seu aparelho é diferente da localização do ônibus. Você pode desligá-la a qualquer momento.",
  ],
  [
    "Como conferir de onde o ônibus sai?",
    "Escolha uma linha e leia Saindo de e Em direção a. Use Inverter sentido para consultar o caminho contrário. Confira o dia da viagem e as notas de cada horário: alguns percursos têm variações.",
  ],
  [
    "Os pontos de embarque estão confirmados?",
    "Ruas e bairros ajudam a entender o trajeto, mas não garantem um ponto de embarque. O mapa indica referências aproximadas ou confirmadas; confirme o local de embarque e a operação com a operadora.",
  ],
  [
    "De onde vêm os horários?",
    "A base reúne informações públicas de transporte de Registro, São Paulo. Nos detalhes de cada linha, abra Fonte, vigência e texto publicado para consultar o documento e sua data de conferência. O projeto é independente e a vigência operacional ainda precisa de confirmação.",
  ],
];
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
      <section
        className="passenger-help"
        id="como-usar"
        aria-labelledby="help-title"
      >
        <span className="eyebrow">VIAJE COM MAIS CLAREZA</span>
        <h2 id="help-title">Seu guia para usar o transporte</h2>
        <div className="help-grid">
          {questions.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
        <p className="help-source">
          Projeto independente sobre a mobilidade em Registro, SP. Consulte
          também os{" "}
          <a
            href="https://registro.sp.gov.br/horarios-de-onibus/"
            target="_blank"
            rel="noopener noreferrer"
          >
            horários publicados pela Prefeitura de Registro (abre em outra aba)
          </a>
          .
        </p>
      </section>
    </>
  );
}
