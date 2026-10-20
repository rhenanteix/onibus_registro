"use client";
import { useEffect, useState } from "react";
const key = "mobilidade:favorites:v1";
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  useEffect(() => {
    try {
      const x = JSON.parse(localStorage.getItem(key) ?? "[]");
      if (Array.isArray(x))
        setFavorites(x.filter((v) => typeof v === "string"));
    } catch {}
  }, []);
  function toggle(id: string) {
    setFavorites((old) => {
      const next = old.includes(id)
        ? old.filter((x) => x !== id)
        : [...old, id];
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {}
      return next;
    });
  }
  return { favorites, toggle };
}
