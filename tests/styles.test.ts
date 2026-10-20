import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const srcDir = path.join(root, "src");
const css = readFileSync(path.join(srcDir, "app", "globals.css"), "utf8");
const definedClasses = new Set(
  [...css.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)].map((match) => match[1]),
);

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    return statSync(full).isDirectory() ? sourceFiles(full) : [full];
  });
}

/** Expressões de className, com o texto literal entre aspas nos casos diretos. */
function classNameExpressions(source: string): string[] {
  const expressions: string[] = [];
  const pattern = /className=/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(source))) {
    const start = match.index + match[0].length;
    const quote = source[start];
    if (quote === '"' || quote === "'") {
      const end = source.indexOf(quote, start + 1);
      expressions.push(`"${source.slice(start + 1, end)}"`);
      pattern.lastIndex = end + 1;
      continue;
    }
    if (source[start] === "{") {
      let depth = 0;
      let cursor = start;
      for (; cursor < source.length; cursor++) {
        if (source[cursor] === "{") depth++;
        else if (source[cursor] === "}") {
          depth--;
          if (depth === 0) break;
        }
      }
      expressions.push(source.slice(start + 1, cursor));
      pattern.lastIndex = cursor + 1;
    }
  }
  return expressions;
}

/** Nomes de classe de dentro de uma expressão, sem identificadores soltos. */
function classTokens(expression: string): string[] {
  const tokens: string[] = [];
  for (const match of expression.matchAll(/"([^"]*)"|'([^']*)'|`([^`]*)`/g)) {
    const template = match[3];
    if (template === undefined) {
      tokens.push(...(match[1] ?? match[2] ?? "").split(/\s+/));
      continue;
    }
    const blocks = template.split(/\$\{[^}]*\}/);
    tokens.push(...blocks.join(" ").split(/\s+/));
    for (const block of template.match(/\$\{[^}]*\}/g) ?? []) {
      for (const inner of block.matchAll(
        /[?:]\s*"([^"]*)"|[?:]\s*'([^']*)'/g,
      )) {
        tokens.push(...(inner[1] ?? inner[2] ?? "").split(/\s+/));
      }
    }
  }
  return tokens
    .map((token) => token.trim())
    .filter((token) => /^[A-Za-z][\w-]*$/.test(token));
}

test("toda classe usada no JSX existe na folha de estilos do projeto", () => {
  const missing = new Map<string, string[]>();
  for (const file of sourceFiles(srcDir).filter((name) =>
    name.endsWith(".tsx"),
  )) {
    const source = readFileSync(file, "utf8");
    for (const expression of classNameExpressions(source)) {
      for (const token of classTokens(expression)) {
        if (definedClasses.has(token)) continue;
        const files = missing.get(token) ?? [];
        files.push(path.relative(root, file));
        missing.set(token, files);
      }
    }
  }
  assert.deepEqual(
    [...missing.entries()].map(
      ([token, files]) => `${token} em ${files.join(", ")}`,
    ),
    [],
    "classe usada no JSX sem definição no CSS: use as classes do projeto",
  );
});

test("toda rota tem um destino para o link de salto do cabeçalho", () => {
  const routes = sourceFiles(path.join(srcDir, "app")).filter((file) =>
    /(?:\/|^)(page|error|not-found)\.tsx$/.test(file),
  );
  const portal = readFileSync(
    path.join(srcDir, "components/mobility/MobilityPortal.tsx"),
    "utf8",
  );
  const withoutAnchor = routes.filter((file) => {
    const source = readFileSync(file, "utf8");
    if (source.includes('id="conteudo"')) return false;
    return !(
      source.includes("<MobilityPortal") && portal.includes('id="conteudo"')
    );
  });
  assert.deepEqual(
    withoutAnchor.map((file) => path.relative(root, file)),
    [],
    'rota sem id="conteudo": o link de salto não leva a lugar nenhum',
  );
});
