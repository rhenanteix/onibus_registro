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
/** Nomes dos dias da semana em português, começando no domingo. */
export const weekdayNames = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];
/** Data local de São Paulo em AAAA-MM-DD, usada pelo calendário de feriados. */
export function saoPauloDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (name: string) => parts.find((x) => x.type === name)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}
/** Converte AAAA-MM-DD em um instante ao meio-dia UTC, o mesmo dia em São Paulo. */
export function dateFromKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}
export function dayForLine(keys: string[], date = new Date()): DayKey {
  const c = saoPauloClock(date);
  return keys.includes("tuewedfri") && ["Tue", "Wed", "Fri"].includes(c.weekday)
    ? "tuewedfri"
    : c.day;
}
const TIME_TOKEN = /(?<!\d)(\d{1,2})\s*(?:[hH]\s*:?|:\s*[hH]?)\s*(\d{2})(?!\d)/;

export interface ParsedTime {
  raw: string;
  time: string;
  note: string;
  variant: string;
  uncertain: boolean;
}

// Centraliza o parsing de horários da fonte pública. A fonte mistura "06h55",
// "20:10", "11h:55", "07h50?", "07h55 (extra)", "07h30(Direto)" etc. O texto
// original fica em raw e as marcações (?, extra, direto, via ...) se separam
// em note/uncertain; o horário normalizado fica em time (HH:MM).
export function parseSourceTime(raw: string): ParsedTime | null {
  const match = raw.match(TIME_TOKEN);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) {
    throw new Error(`Horário fora do alcance: ${raw}`);
  }
  const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  const index = match.index ?? 0;
  const pre = raw.slice(0, index);
  let tail = raw.slice(index + match[0].length);
  // Remove um eventual horário seguinte no mesmo trecho (ex. "07h50?– 08h55"):
  // o parsing por linha já isola cada token, e aqui um único token vira um
  // registro, sem perder nem alterar o vizinho.
  const next = tail.match(TIME_TOKEN);
  if (next) tail = tail.slice(0, next.index ?? 0);
  const uncertain = /[?]/.test(tail) || /[-–]\s*\?\s*$/.test(pre);
  let note = tail.replace(/\?/g, "").replace(/^[\s\u2013-]+|[\s\u2013-]+$/g, "").trim();
  note = note.replace(/^\(|\)$/g, "").trim();
  return { raw, time, note, variant: "Padrão", uncertain };
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
