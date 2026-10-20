import { test } from "node:test";
import assert from "node:assert/strict";
import { renderMarkdown } from "../src/lib/markdown.ts";

test("o título do documento fica abaixo do h1 da página", () => {
  const html = renderMarkdown("# Roadmap\n\n## Versão 0.2.0");
  assert.ok(html.includes("<h2>Roadmap</h2>"));
  assert.ok(html.includes("<h3>Versão 0.2.0</h3>"));
  assert.ok(!html.includes("<h1>"));
});

test("a profundidade de títulos é limitada ao nível 6", () => {
  const html = renderMarkdown("###### Nível seis");
  assert.ok(html.includes("<h6>Nível seis</h6>"));
  assert.ok(!html.includes("<h7>"));
});

test("o texto original é preservado, com acentuação", () => {
  const html = renderMarkdown("Rota para **Registro** com saída às 07:30.");
  assert.ok(html.includes("<strong>Registro</strong>"));
  assert.ok(html.includes("saída às 07:30"));
});

test("a lista de tarefas do markdown continua sendo lida", () => {
  const html = renderMarkdown("- [x] Entregue\n- [ ] Em aberto");
  assert.ok(html.includes("checked"));
  assert.ok(html.includes("Entregue"));
  assert.ok(html.includes("Em aberto"));
});

test("HTML bruto do documento não é injetado na página", () => {
  const html = renderMarkdown("<script>alert(1)</script>\n\nTexto");
  assert.ok(!html.includes("<script>"));
  assert.ok(!html.includes("onclick"));
  assert.ok(html.includes("Texto"));
});

test("links com protocolo perigoso ficam sem endereço", () => {
  const html = renderMarkdown("[clique](javascript:alert(1))");
  assert.ok(!html.includes("javascript:"));
  assert.ok(html.includes("clique"));
});

test("links http e internos são mantidos", () => {
  const html = renderMarkdown(
    "[fonte](https://registro.sp.gov.br/horarios-de-onibus/) e [interno](/docs)",
  );
  assert.ok(
    html.includes('href="https://registro.sp.gov.br/horarios-de-onibus/"'),
  );
  assert.ok(html.includes('href="/docs"'));
});
