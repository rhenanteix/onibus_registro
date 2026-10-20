import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  nextDeparture,
  dayForLine,
  distanceMeters,
  destinationMatches,
  normalize,
} from "../src/lib/domain.ts";
import type { Departure, Journey } from "../src/types/transit.ts";
const read = (name: string) =>
  JSON.parse(
    readFileSync(new URL(`../src/data/${name}.json`, import.meta.url), "utf8"),
  );
test("uncertain departures never appear as the next service", () => {
  const rows: Departure[] = [
    {
      time: "07:50",
      uncertain: true,
      note: "",
      variant: "Padrão",
      sourceStatus: "published",
    },
    {
      time: "08:00",
      uncertain: false,
      note: "",
      variant: "Padrão",
      sourceStatus: "published",
    },
  ];
  assert.equal(nextDeparture(rows, 470)?.time, "08:00");
  assert.equal(nextDeparture(rows, 481), null);
});
test("R6 is restricted to Tuesday, Wednesday and Friday in São Paulo", () => {
  assert.equal(
    dayForLine(["tuewedfri"], new Date("2026-10-20T15:00:00Z")),
    "tuewedfri",
  );
  assert.equal(
    dayForLine(["tuewedfri"], new Date("2026-10-22T15:00:00Z")),
    "week",
  );
  assert.equal(dayForLine(["week"], new Date("2026-10-24T02:00:00Z")), "week");
});
test("all original destinations and journey references remain available", () => {
  const lines = read("lines");
  const journeys = read("journeys");
  assert.equal(lines.length, 15);
  const sequences = Object.values(journeys).flat() as Journey[];
  assert.equal(sequences.length, 42);
  assert.equal(
    sequences.reduce((n, j) => n + j.points.length, 0),
    404,
  );
  for (const line of lines) assert.ok(journeys[line.id]?.length);
  for (const j of sequences) {
    assert.equal(j.boardingValidated, false);
    for (const p of j.points) {
      assert.equal(p.boardingValidated, false);
      if (p.position) {
        assert.ok(Number.isFinite(p.position.lat));
        assert.ok(Number.isFinite(p.position.lon));
      }
    }
  }
});
test("search ignores accents and reaches references without coordinates", () => {
  assert.equal(normalize("São PAULO"), "sao paulo");
  const journeys = Object.values(read("journeys")).flat() as Journey[];
  const pending = journeys.flatMap((j) => j.points).find((p) => !p.position)!;
  assert.ok(destinationMatches(journeys, pending.label));
});
test("no route is invented for L6 and OSM stations are not linked to lines", () => {
  const routes = read("routes");
  assert.ok(!routes.L6);
  for (const stop of read("stops")) assert.deepEqual(stop.lineIds, []);
});
test("distance is measured in meters, not an ETA or walking route", () => {
  assert.equal(distanceMeters({ lat: 0, lon: 0 }, { lat: 0, lon: 0 }), 0);
  assert.ok(
    Math.abs(distanceMeters({ lat: 0, lon: 0 }, { lat: 0, lon: 1 }) - 111195) <
      10,
  );
});
