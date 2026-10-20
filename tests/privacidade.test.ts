import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const srcDir = path.join(root, "src");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    return statSync(full).isDirectory() ? sourceFiles(full) : [full];
  });
}

const tsx = sourceFiles(srcDir).filter((file) => file.endsWith(".tsx"));
const ts = sourceFiles(srcDir).filter((file) => file.endsWith(".ts"));
const read = (file: string) => readFileSync(file, "utf8");

test("nenhum recurso de imagem ou script externo é carregado pelo portal", () => {
  const proibidos = [
    /<img[^>]+src=["']https?:/i,
    /<script[^>]+src=["']https?:/i,
    /<iframe[^>]+src=["']https?:/i,
    /<link[^>]+href=["']https?:/i,
  ];
  for (const file of [...tsx, ...ts]) {
    const source = read(file);
    for (const padrao of proibidos) {
      assert.ok(
        !padrao.test(source),
        `carregamento externo automático em ${path.relative(root, file)}`,
      );
    }
  }
});

test("os únicos endereços externos do código estão em links de ação do usuário", () => {
  const externos = /https?:\/\/[^\s"'`)]+/g;
  const excecoes = new Set([
    "https://schema.org", // JSON-LD vocabulary; never fetched.
    "https://www.openstreetmap.org/copyright",
    "https://www.openstreetmap.org",
    // Endereço do próprio projeto, usado como servidor na especificação.
    "https://onibusregistro-yeal.vercel.app",
  ]);
  for (const file of [...tsx, ...ts]) {
    const source = read(file);
    for (const achado of source.match(externos) ?? []) {
      const endereco = achado.replace(/[.,;]$/, "");
      if (excecoes.has(endereco)) continue;
      if (
        path.relative(srcDir, file) === "lib/domain.ts" &&
        endereco.startsWith("https://github.com/${owner}/${repo}/issues/new?")
      ) {
        const timetable = read(
          path.join(srcDir, "components/mobility/Timetable.tsx"),
        );
        assert.match(timetable, /href=\{buildIssueUrl\(/);
        assert.match(timetable, /target="_blank"/);
        continue;
      }
      if (endereco.startsWith("https://{s}.tile.openstreetmap.org")) continue;
      if (endereco.startsWith("https://www.google.com/maps/@?api=1")) continue;
      // O visualizador Redoc da página /docs/api é a única exceção
      // conhecida: está documentado em THIRD_PARTY.md e aviso na página.
      if (endereco.startsWith("https://cdn.redoc.ly")) continue;
      assert.ok(
        source.includes('target="_blank"'),
        `endereço externo sem ação explícita em ${path.relative(root, file)}: ${endereco}`,
      );
    }
  }
});

test("os tiles do mapa usam apenas o provedor documentado", () => {
  const mapa = read(path.join(srcDir, "components", "map", "TransitMap.tsx"));
  const tiles = mapa.match(/url="https:\/\/[^"]+"/) ?? [];
  assert.equal(tiles.length, 1);
  assert.match(tiles[0], /tile\.openstreetmap\.org/);
});

test("o link de entorno é explícito, abre em outra aba e não vaza referência", () => {
  const timeline = read(
    path.join(srcDir, "components", "mobility", "JourneyTimeline.tsx"),
  );
  assert.ok(timeline.includes('target="_blank"'));
  assert.ok(timeline.includes('rel="noopener noreferrer"'));
  assert.ok(timeline.includes('referrerPolicy="no-referrer"'));
  assert.ok(timeline.includes("Ver entorno"));
});

test("a referência visual da API só é buscada depois do clique", () => {
  const api = read(path.join(srcDir, "app", "docs", "api", "page.tsx"));
  assert.ok(api.includes("cdn.redoc.ly"));
  assert.ok(api.includes("onClick"), "sem ação do usuário para carregar o CDN");
  assert.ok(
    !api.includes("useEffect"),
    "o CDN não pode ser buscado ao montar a página",
  );
});

test("o texto de privacidade cita a única requisição externa", () => {
  const projeto = read(path.join(srcDir, "app", "projeto", "page.tsx"));
  assert.ok(/tiles/i.test(projeto));
  assert.ok(/única[\s\S]{0,40}requisi/i.test(projeto));
  assert.ok(/Ver entorno/.test(projeto));
});
