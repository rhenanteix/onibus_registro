"use client";
import { useEffect, useRef, useState } from "react";
import {
  readReminder,
  reminderPhase,
  type DepartureReminder,
} from "@/lib/travel-assistance";

const storageKey = "mobilidade:departure-reminder:v1";
export function useDepartureReminder() {
  const [reminder, setReminder] = useState<DepartureReminder | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [alert, setAlert] = useState("");
  const current = useRef<DepartureReminder | null>(null);
  function save(value: DepartureReminder | null) {
    current.current = value;
    setReminder(value);
    try {
      if (value) sessionStorage.setItem(storageKey, JSON.stringify(value));
      else sessionStorage.removeItem(storageKey);
    } catch {
      /* The in-memory reminder remains available if storage is blocked. */
    }
  }
  useEffect(() => {
    try {
      const saved = readReminder(sessionStorage.getItem(storageKey));
      current.current = saved;
      setReminder(saved);
      if (!saved) sessionStorage.removeItem(storageKey);
    } catch {
      /* Storage may be disabled. */
    }
    const tick = async () => {
      const value = current.current;
      if (!value) return;
      const phase = reminderPhase(value);
      if (phase === "waiting") return;
      save(null); // Consume before awaiting: no duplicate alert on visibility changes.
      if (phase === "expired") {
        setMessage(
          `O horário de ${value.time} da ${value.lineId} já passou. Escolha outra saída.`,
        );
        return;
      }
      const minutes = Math.max(
        1,
        Math.ceil((value.departureAt - Date.now()) / 60000),
      );
      const body = `${value.lineId}: saída publicada às ${value.time}, de ${value.origin} para ${value.destination}. Faltam cerca de ${minutes} min. Não é previsão de chegada ao ponto.`;
      setAlert(body);
      setMessage("Lembrete exibido. Confira o horário com a operadora.");
      if (
        value.system &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (!registration?.active)
            throw new Error("Service worker unavailable");
          await registration.showNotification("Sua saída está próxima", {
            body,
            icon: "/icon-192.png",
            tag: value.id,
            data: { url: "/" },
          });
        } catch {
          setMessage(
            "O celular não exibiu a notificação. Seu lembrete está visível aqui na página.",
          );
        }
      }
    };
    void tick();
    const timer = window.setInterval(() => {
      void tick();
    }, 15000);
    const visible = () => {
      if (!document.hidden) void tick();
    };
    document.addEventListener("visibilitychange", visible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", visible);
    };
  }, []);
  async function schedule(value: Omit<DepartureReminder, "system">) {
    if (busy) return;
    setBusy(true);
    setAlert("");
    let system = false;
    let result = "Lembrete visual ativado. Mantenha esta página aberta.";
    try {
      if (
        "Notification" in window &&
        "serviceWorker" in navigator &&
        window.isSecureContext
      ) {
        const permission = await Notification.requestPermission();
        system = permission === "granted";
        result = system
          ? "Notificação autorizada. Mantenha esta página aberta e ativa até o aviso."
          : "Notificações não autorizadas. O lembrete aparecerá somente nesta página.";
      } else {
        result =
          "Este navegador não oferece notificações aqui. O lembrete será exibido nesta página aberta.";
      }
      if (value.departureAt <= Date.now()) {
        setMessage("Este horário já passou. Escolha uma nova saída.");
        return;
      }
      save({ ...value, system });
      setMessage(result);
    } catch {
      save({ ...value, system: false });
      setMessage(
        "Não foi possível autorizar notificações. O lembrete será visual, nesta página aberta.",
      );
    } finally {
      setBusy(false);
    }
  }
  function cancel() {
    save(null);
    setMessage("Lembrete cancelado.");
    setAlert("");
  }
  return {
    reminder,
    message,
    busy,
    alert,
    schedule,
    cancel,
    dismiss: () => setAlert(""),
  };
}
