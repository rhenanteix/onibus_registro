"use client";
export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main id="conteudo" className="project-page">
      <h1>Não foi possível abrir esta consulta.</h1>
      <p>Tente novamente. Se estiver sem conexão, abra a página offline.</p>
      <button className="primary" onClick={reset}>
        Tentar novamente
      </button>
      <a href="/offline.html">Consulta offline</a>
    </main>
  );
}
