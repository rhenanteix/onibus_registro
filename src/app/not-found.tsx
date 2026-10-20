import Link from "next/link";
export default function NotFound() {
  return (
    <main id="conteudo" className="project-page">
      <h1>Este caminho não foi encontrado.</h1>
      <Link href="/">Voltar às linhas</Link>
    </main>
  );
}
