import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p className="footer-note">
          Projeto aberto e independente, sem vínculo oficial com a prefeitura ou
          a operadora. Horários e itinerários: Prefeitura Municipal de Registro,
          coletados em 20/10/2026.
        </p>
        <nav className="footer-links" aria-label="Rodapé">
          <Link href="/projeto">Sobre o projeto</Link>
          <Link href="/docs">Documentação</Link>
          <Link href="/roadmap">Roadmap</Link>
          <Link href="/licenca">Licença dos dados</Link>
        </nav>
      </div>
    </footer>
  );
}
