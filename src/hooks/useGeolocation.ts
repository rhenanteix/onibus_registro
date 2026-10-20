"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { UserPosition } from "@/types/transit";
export function useGeolocation() {
  const [position, setPosition] = useState<UserPosition | null>(null);
  const [status, setStatus] = useState("Localização desligada");
  const [active, setActive] = useState(false);
  const watch = useRef<number | null>(null);
  const clear = useCallback(() => {
    if (watch.current !== null) navigator.geolocation.clearWatch(watch.current);
    watch.current = null;
  }, []);
  const stop = useCallback(() => {
    clear();
    setActive(false);
    setPosition(null);
    setStatus("Localização desligada");
  }, [clear]);
  const start = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("Este navegador não oferece localização.");
      return;
    }
    setActive(true);
  }, []);
  useEffect(() => {
    if (!active) return;
    const run = () => {
      clear();
      if (document.hidden) {
        setStatus("Localização pausada");
        return;
      }
      setStatus("Buscando sua localização…");
      watch.current = navigator.geolocation.watchPosition(
        (p) => {
          setPosition({
            lat: p.coords.latitude,
            lon: p.coords.longitude,
            accuracy: p.coords.accuracy,
          });
          setStatus("Sua localização está ativa");
        },
        (e) => {
          setPosition(null);
          setStatus(
            e.code === 1
              ? "Permissão negada. Libere a localização nas configurações do navegador."
              : e.code === 3
                ? "A localização demorou. Tente em uma área aberta."
                : "Não foi possível obter sua localização.",
          );
          clear();
          setActive(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 15000 },
      );
    };
    run();
    document.addEventListener("visibilitychange", run);
    return () => {
      clear();
      document.removeEventListener("visibilitychange", run);
    };
  }, [active, clear]);
  return { position, status, active, start, stop };
}
