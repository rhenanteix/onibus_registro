import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { BusFront, ArrowUpRight } from "lucide-react";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";
import { siteUrl, siteDescription } from "@/lib/site";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Mobilidade Registro",
    title: "Ônibus em Registro: linhas, horários e percursos",
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: "Mobilidade Registro",
    description: siteDescription,
  },
  title: {
    default: "Ônibus em Registro — horários e linhas | Mobilidade Registro",
    template: "%s · Mobilidade Registro",
  },
  description: siteDescription,
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
            <Link href="/docs">Documentação</Link>
          </nav>
          <span className="open-label">ÔNIBUS EM REGISTRO</span>
        </header>
        {children}
        <InstallPrompt />
        <Footer />
      </body>
    </html>
  );
}
