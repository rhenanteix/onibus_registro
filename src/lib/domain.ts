import type { DayKey, Departure, Journey } from "../types/transit.ts";
export function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
export function distanceMeters(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
) {
  const rad = (v: number) => (v * Math.PI) / 180;
  const dlat = rad(b.lat - a.lat),
    dlon = rad(b.lon - a.lon);
  const h =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dlon / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
export function saoPauloClock(date = new Date()) {
  const p = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (name: string) => p.find((x) => x.type === name)?.value ?? "";
  const weekday = get("weekday");
  return {
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
    day: (weekday === "Sat"
      ? "sat"
      : weekday === "Sun"
        ? "sun"
        : "week") as DayKey,
    weekday,
  };
}
export function dayForLine(keys: string[], date = new Date()): DayKey {
  const c = saoPauloClock(date);
  return keys.includes("tuewedfri") && ["Tue", "Wed", "Fri"].includes(c.weekday)
    ? "tuewedfri"
    : c.day;
}
export function nextDeparture(rows: Departure[], minutes: number) {
  return (
    rows
      .filter(
        (d) =>
          !d.uncertain &&
          /^\d{2}:\d{2}$/.test(d.time) &&
          Number(d.time.slice(0, 2)) * 60 + Number(d.time.slice(3)) >= minutes,
      )
      .sort((a, b) => a.time.localeCompare(b.time))[0] ?? null
  );
}
export function destinationMatches(journeys: Journey[], query: string) {
  const q = normalize(query);
  return journeys.some((j) =>
    j.points.some((p) => normalize(p.label).includes(q)),
  );
}
export function routeColor(id: string) {
  return id.startsWith("R")
    ? "#a75623"
    : id.startsWith("U")
      ? "#6750a4"
      : "#12624b";
}
