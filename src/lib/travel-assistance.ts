import { distanceMeters, saoPauloClock, saoPauloDateKey } from "./domain.ts";
import type {
  Catalog,
  UserPosition,
  Journey,
  ReferencePoint,
} from "../types/transit.ts";

export interface NearbyReference {
  lineId: string;
  journey: Journey;
  point: ReferencePoint;
  meters: number;
}
/** Geographic references only: distance is not a walking route or confirmed stop. */
export function nearbyReferences(
  catalog: Pick<Catalog, "journeys"> & { lines: { id: string }[] },
  position: UserPosition,
): NearbyReference[] {
  if (!Number.isFinite(position.accuracy) || position.accuracy > 1000)
    return [];
  return catalog.lines
    .flatMap((line) => {
      let closest: NearbyReference | null = null;
      for (const journey of catalog.journeys[line.id] ?? []) {
        for (const point of journey.points) {
          if (!point.position) continue;
          const meters = distanceMeters(position, point.position);
          if (meters <= 2000 && (!closest || meters < closest.meters)) {
            closest = { lineId: line.id, journey, point, meters };
          }
        }
      }
      return closest ? [closest] : [];
    })
    .sort((a, b) => a.meters - b.meters);
}

export interface DepartureReminder {
  id: string;
  lineId: string;
  origin: string;
  destination: string;
  time: string;
  date: string;
  departureAt: number;
  system: boolean;
}
/** Same-day departure instant, calculated with the São Paulo clock, not the device timezone. */
export function departureInstant(
  time: string,
  now = new Date(),
): number | null {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return null;
  const minutes = Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
  const delta = minutes - saoPauloClock(now).minutes;
  const instant =
    now.getTime() +
    delta * 60000 -
    now.getSeconds() * 1000 -
    now.getMilliseconds();
  return instant > now.getTime() ? instant : null;
}
export function reminderPhase(reminder: DepartureReminder, now = Date.now()) {
  if (now >= reminder.departureAt) return "expired";
  return now >= reminder.departureAt - 10 * 60000 ? "due" : "waiting";
}
export function readReminder(
  raw: string | null,
  now = Date.now(),
): DepartureReminder | null {
  try {
    const r = JSON.parse(raw ?? "null");
    if (
      !r ||
      ![r.id, r.lineId, r.origin, r.destination, r.time, r.date].every(
        (v) => typeof v === "string",
      ) ||
      typeof r.system !== "boolean" ||
      !Number.isFinite(r.departureAt) ||
      r.date !== saoPauloDateKey(new Date(now)) ||
      r.departureAt <= now ||
      r.departureAt - now > 86400000
    )
      return null;
    return r;
  } catch {
    return null;
  }
}
