"use client";
import { useEffect, useState } from "react";
import { Download, Share2, X, Check } from "lucide-react";
interface InstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
export function InstallPrompt() {
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [help, setHelp] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const media = matchMedia("(display-mode: standalone)");
    const standalone =
      media.matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    setInstalled(standalone);
    setIos(/iPad|iPhone|iPod/.test(navigator.userAgent));
    const before = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallEvent);
    };
    const done = () => {
      setInstalled(true);
      setVisible(false);
      setPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", before);
    window.addEventListener("appinstalled", done);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => navigator.serviceWorker.ready)
        .then(async () => {
          const response = await fetch("/api/catalog", { cache: "no-store" });
          if (response.ok) {
            const cache = await caches.open("mobilidade-next-v1");
            await cache.put("/api/catalog", response);
          }
        })
        .catch(() => setMessage("O modo offline não pôde ser ativado."));
    }
    return () => {
      window.removeEventListener("beforeinstallprompt", before);
      window.removeEventListener("appinstalled", done);
    };
  }, []);
  async function install() {
    if (!prompt) {
      setHelp(true);
      return;
    }
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === "accepted") setVisible(false);
      setPrompt(null);
    } catch {
      setHelp(true);
    }
  }
  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem("mobilidade:install-dismissed", String(Date.now()));
    } catch {}
  }
  if (installed) return null;
  return (
    <>
      <button
        className="install-fixed"
        aria-expanded={visible}
        aria-label="Instalar aplicativo"
        onClick={() => {
          setVisible(true);
          setHelp(false);
        }}
      >
        <Download size={17} /> Instalar app
      </button>
      {visible && (
        <aside className="install-card" aria-label="Instalar aplicativo">
          <button
            className="icon-button close-install"
            aria-label="Fechar convite de instalação"
            onClick={dismiss}
          >
            <X size={18} />
          </button>
          <div className="install-symbol">
            <Download size={23} />
          </div>
          <strong>Seu caminho, a um toque.</strong>
          <p>
            Adicione à tela inicial para abrir como aplicativo. Sem precisar de
            cadastro.
          </p>
          {help ? (
            <p className="install-help">
              <Share2 size={17} />
              {ios
                ? "No navegador, toque em Compartilhar e depois em “Adicionar à Tela de Início”. Se a opção não aparecer, abra no Safari."
                : "Abra o menu do navegador e procure “Instalar aplicativo” ou “Adicionar à tela inicial”. A disponibilidade depende do navegador."}
            </p>
          ) : null}
          <button className="primary" onClick={install}>
            {prompt ? "Instalar no dispositivo" : "Ver como instalar"}{" "}
            <Check size={16} />
          </button>
          <small>Você confirma a instalação no seu celular. {message}</small>
        </aside>
      )}
    </>
  );
}
