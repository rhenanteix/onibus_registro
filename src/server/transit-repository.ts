import "server-only";
import lines from "@/data/lines.json";
import journeys from "@/data/journeys.json";
import schedules from "@/data/schedules.json";
import routes from "@/data/routes.json";
import stops from "@/data/stops.json";
import feriados from "@/data/feriados.json";
import type { Catalog } from "@/types/transit";
// One replacement point for a future database or operator adapter. No client secrets.
export function getCatalog(): Catalog {
  return {
    lines,
    journeys,
    schedules,
    routes,
    stops,
    holidays: feriados,
  } as unknown as Catalog;
}
export function getLine(id: string) {
  const c = getCatalog();
  const line = c.lines.find((l) => l.id === id);
  return line
    ? {
        line,
        journeys: c.journeys[id] ?? [],
        schedules: c.schedules[id] ?? {},
        route: c.routes[id] ?? null,
      }
    : null;
}
