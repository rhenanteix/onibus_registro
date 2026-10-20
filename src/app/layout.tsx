import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { BusFront, ArrowUpRight } from "lucide-react";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Mobilidade Registro — seu próximo caminho",
    template: "%s · Mobilidade Registro",
  },
  description:
    "Linhas, horários e percursos de referência do transporte de Registro. Projeto aberto e independente.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mobilidade",
  },
  icons: { icon: "/icon.svg", apple: "/icon-192.png" },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#12624b",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <a href="#conteudo" className="skip-link">
          Ir para conteúdo
        </a>
        <header className="topbar">
          <Link href="/" className="wordmark">
            <BusFront size={23} />
            <span>
              mobilidade<span className="wordmark-city">registro</span>
            </span>
          </Link>
          <nav aria-label="Principal">
            <Link href="/">Explorar linhas</Link>
            <Link href="/projeto">
              Sobre o projeto <ArrowUpRight size={14} />
            </Link>
          </nav>
          <span className="open-label">ABERTO À CIDADE</span>
        </header>
        {children}
        <InstallPrompt />
      </body>
    </html>
  );
}
