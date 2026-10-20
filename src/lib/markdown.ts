import { marked, Renderer, type Tokens } from "marked";

const MAX_HEADING_LEVEL = 6;
const SAFE_URL = /^(https?:|mailto:|#|\/)/i;

function escapeAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Converte markdown em HTML para as páginas públicas de documentação.
 * O texto original é preservado; apenas a marcação é adjustada:
 * - títulos descem um nível, porque a página já tem um h1 próprio;
 * - HTML bruto é descartado, para que um arquivo versionado não injete
 *   marcação na página;
 * - links e imagens só são mantidos com endereço http(s), mailto, âncora
 *   ou caminho interno.
 */
export function renderMarkdown(source: string): string {
  const renderer = new Renderer();

  renderer.heading = ({ tokens, depth }: Tokens.Heading) => {
    const level = Math.min(depth + 1, MAX_HEADING_LEVEL);
    return `<h${level}>${renderer.parser.parseInline(tokens)}</h${level}>\n`;
  };

  renderer.html = () => "";

  renderer.link = ({ href, title, text, tokens, autolink }: Tokens.Link) => {
    const label = autolink
      ? escapeAttribute(text)
      : renderer.parser.parseInline(tokens);
    if (!SAFE_URL.test(href)) return label;
    const titleAttribute = title ? ` title="${escapeAttribute(title)}"` : "";
    return `<a href="${escapeAttribute(href)}"${titleAttribute}>${label}</a>`;
  };

  renderer.image = ({ href, title, text, tokens }: Tokens.Image) => {
    const alt = renderer.parser.parseInline(tokens);
    if (!SAFE_URL.test(href)) return alt;
    const titleAttribute = title ? ` title="${escapeAttribute(title)}"` : "";
    return `<img src="${escapeAttribute(href)}" alt="${escapeAttribute(text)}"${titleAttribute} />`;
  };

  return marked.parse(source, { renderer, gfm: true, async: false });
}
