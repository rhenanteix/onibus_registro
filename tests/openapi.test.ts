import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  API_VERSION,
  PRODUCTION_URL,
  openApiSpec,
} from "../src/server/openapi-spec.ts";

const read = (name: string) =>
  JSON.parse(readFileSync(new URL(`../${name}`, import.meta.url), "utf8"));

test("a versão da API acompanha a versão do projeto", () => {
  assert.equal(API_VERSION, read("package.json").version);
});

test("o servidor de produção é o site publicado e está no README", () => {
  const spec = openApiSpec();
  assert.equal(spec.servers[0].url, PRODUCTION_URL);
  assert.ok(PRODUCTION_URL.startsWith("https://"));
  const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
  assert.ok(readme.includes(PRODUCTION_URL));
});

test("a especificação não promete dado de frota em tempo real", () => {
  const spec = openApiSpec();
  const description = spec.info.description.toLowerCase();
  assert.ok(
    description.includes(
      "não há rastreamento da frota nem previsão de chegada",
    ),
  );
  assert.ok(!description.includes("dados em tempo real"));
  const realtimeTag = spec.tags.find((tag) => tag.name === "Tempo Real");
  assert.ok(realtimeTag?.description.toLowerCase().includes("não simula"));
});

test("os exemplos de ID de linha existem na base versionada", () => {
  const spec = openApiSpec();
  const parameter = spec.paths["/api/lines/{id}"].get.parameters[0];
  const examples = parameter.description
    .replace(/^.*ex:/, "")
    .replace(/[).]/g, "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  assert.ok(examples.length > 0);
  const ids = new Set(read("src/data/lines.json").map((line: any) => line.id));
  for (const example of examples) {
    assert.ok(ids.has(example), `exemplo de linha inexistente: ${example}`);
  }
});
