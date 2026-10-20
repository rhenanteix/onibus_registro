/**
 * Relatório das referências do percurso e da situação de localização.
 *
 *   node --experimental-strip-types tools/reports/referencias.ts            # relatório no terminal
 *   node --experimental-strip-types tools/reports/referencias.ts --check    # só verifica a consistência
 *   node --experimental-strip-types tools/reports/referencias.ts --write    # grava docs/REFERENCIAS.md
 *
 * O relatório é reproduzível: ele lê apenas src/data/journeys.json, não
 * consulta serviço externo e não altera coordenadas.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Journey, LocationStatus } from "../../src/types/transit.ts";
import {
  collectReferences,
  countByLine,
  locationStatusFor,
} from "../../src/lib/references.ts";

const root = fileURLToPath(new URL("../../", import.meta.url));
const dataPath = path.join(root, "src", "data", "journeys.json");
const outputPath = path.join(root, "docs", "REFERENCIAS.md");

const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const write = args.includes("--write");

const journeys = JSON.parse(readFileSync(dataPath, "utf8")) as Record<
  string,
  Journey[]
>;
const records = collectReferences(journeys);
const counts = countByLine(records);

const totals = counts.reduce(
  (acc, row) => ({
    total: acc.total + row.total,
    confirmada: acc.confirmada + row.confirmada,
    aproximada: acc.aproximada + row.aproximada,
    sem_localizacao: acc.sem_localizacao + row.sem_localizacao,
  }),
  { total: 0, confirmada: 0, aproximada: 0, sem_localizacao: 0 },
);

/** Referências sem coordenada: continuam no itinerário e não ganham marcador. */
const withoutLocation = records.filter((r) => !r.point.position);

const missingStatus = records.filter((r) => !r.point.locationStatus);
const inconsistencies = records.filter(
  (r) =>
    !!r.point.locationStatus &&
    r.point.locationStatus !== locationStatusFor(r.point),
);

const STATUS_ORDER: LocationStatus[] = [
  "confirmada",
  "aproximada",
  "sem_localizacao",
];

function table() {
  const header =
    "| Linha | Referências | Confirmadas | Aproximadas | Sem localização |";
  const divider = "|---|---|---|---|---|";
  const rows = counts.map(
    (row) =>
      `| ${row.lineId} | ${row.total} | ${row.confirmada} | ${row.aproximada} | ${row.sem_localizacao} |`,
  );
  const footer = `| **Total** | **${totals.total}** | **${totals.confirmada}** | **${totals.aproximada}** | **${totals.sem_localizacao}** |`;
  return [header, divider, ...rows, footer].join("\n");
}

function listWithoutLocation() {
  const byLine = new Map<string, typeof withoutLocation>();
  for (const record of withoutLocation) {
    const list = byLine.get(record.lineId) ?? [];
    list.push(record);
    byLine.set(record.lineId, list);
  }
  const blocks: string[] = [];
  for (const [lineId, list] of [...byLine.entries()].sort((a, b) =>
    a[0].localeCompare(b[0]),
  )) {
    blocks.push(`### ${lineId} (${list.length})`);
    blocks.push("");
    for (const record of list) {
      blocks.push(
        `- ${record.point.sequence}. ${record.point.label} — percurso ${record.journeyId}`,
      );
    }
    blocks.push("");
  }
  return blocks.join("\n");
}

function report() {
  return [
    "# Relatório de referências do percurso",
    "",
    "Gerado por `node --experimental-strip-types tools/reports/referencias.ts`,",
    "a partir de `src/data/journeys.json`. O arquivo é reproduzível e não",
    "consulta serviço externo. Nenhuma coordenada foi criada ou ajustada.",
    "",
    "## Contagem por linha",
    "",
    table(),
    "",
    "## Situações de localização",
    "",
    "- **Confirmada**: ponto de embarque validado pela operadora, com coordenada.",
    "- **Aproximada**: existe coordenada, obtida por aproximação de rua ou bairro.",
    "- **Sem localização**: a referência consta do itinerário e não tem coordenada.",
    "  Ela continua na lista e não recebe marcador no mapa.",
    "",
    "## Referências sem coordenadas",
    "",
    `Total de ${withoutLocation.length} ocorrências em ${new Set(withoutLocation.map((r) => r.point.label)).size} rótulos distintos.`,
    "",
    listWithoutLocation(),
    "## Conferências",
    "",
    `- Referências sem o campo \`locationStatus\`: ${missingStatus.length}`,
    `- Campo \`locationStatus\` incoerente com os dados brutos: ${inconsistencies.length}`,
    "",
  ].join("\n");
}

if (checkOnly) {
  const problems = [
    ...missingStatus.map((r) => `${r.point.id}: sem locationStatus`),
    ...inconsistencies.map(
      (r) =>
        `${r.point.id}: locationStatus ${r.point.locationStatus} não corresponde a ${locationStatusFor(r.point)}`,
    ),
  ];
  if (problems.length) {
    console.error("Referências inconsistentes:\n" + problems.join("\n"));
    process.exit(1);
  }
  console.log(
    `OK: ${totals.total} referências com situação coerente (${totals.aproximada} aproximadas, ${totals.sem_localizacao} sem localização, ${totals.confirmada} confirmadas).`,
  );
} else {
  console.log(report());
  if (write) {
    writeFileSync(outputPath, report(), "utf8");
    console.log(`Relatório gravado em ${path.relative(root, outputPath)}`);
  }
}
