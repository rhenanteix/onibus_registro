import { test } from "node:test";
import assert from "node:assert/strict";
import {
  nearbyReferences,
  departureInstant,
  reminderPhase,
  readReminder,
  type DepartureReminder,
} from "../src/lib/travel-assistance.ts";
import type { Catalog, ReferencePoint, Journey } from "../src/types/transit.ts";
const point = (id: string, lat: number | null): ReferencePoint => ({
  id,
  label: id,
  sequence: 1,
  boardingValidated: false,
  locationStatus: lat === null ? "sem_localizacao" : "aproximada",
  position:
    lat === null ? null : { lat, lon: -47.843, source: "test", method: "test" },
});
const journey = (lineId: string, points: ReferencePoint[]): Journey => ({
  id: lineId,
  lineId,
  direction: 0,
  label: lineId,
  kind: "regular",
  source: "test",
  sourceText: "",
  boardingValidated: false,
  points,
});
const catalog = {
  lines: [{ id: "L1" }, { id: "L2" }, { id: "L3" }],
  journeys: {
    L1: [journey("L1", [point("far", -24.503), point("near", -24.4931)])],
    L2: [journey("L2", [point("unknown", null), point("second", -24.495)])],
    L3: [journey("L3", [point("outside", -25)])],
  },
};
test("nearby references are ranked, deduplicated by line and limited to 2 km", () => {
  const results = nearbyReferences(catalog, {
    lat: -24.493,
    lon: -47.843,
    accuracy: 20,
  });
  assert.deepEqual(
    results.map((x) => [x.lineId, x.point.id]),
    [
      ["L1", "near"],
      ["L2", "second"],
    ],
  );
  assert.ok(results[0].meters < results[1].meters);
});
test("low accuracy and locations outside coverage never automatically select a line", () => {
  assert.deepEqual(
    nearbyReferences(catalog, { lat: -24.493, lon: -47.843, accuracy: 1001 }),
    [],
  );
  assert.deepEqual(
    nearbyReferences(catalog, { lat: 0, lon: 0, accuracy: 10 }),
    [],
  );
});
const now = new Date("2026-10-20T12:00:35.123Z"); // 09:00 in São Paulo
const reminder: DepartureReminder = {
  id: "L1-09:30",
  lineId: "L1",
  origin: "Centro",
  destination: "Bairro",
  date: "2026-10-20",
  time: "09:30",
  departureAt: Date.parse("2026-10-20T12:30:00Z"),
  system: true,
};
test("departure instant uses São Paulo and does not carry past times into tomorrow", () => {
  assert.equal(departureInstant("09:30", now), reminder.departureAt);
  assert.equal(departureInstant("09:00", now), null);
  assert.equal(departureInstant("25:00", now), null);
  assert.equal(
    departureInstant("00:10", new Date("2026-10-21T03:00:00Z")),
    Date.parse("2026-10-21T03:10:00Z"),
  );
});
test("reminders become due ten minutes before departure and expire at departure", () => {
  assert.equal(
    reminderPhase(reminder, reminder.departureAt - 600001),
    "waiting",
  );
  assert.equal(reminderPhase(reminder, reminder.departureAt - 600000), "due");
  assert.equal(reminderPhase(reminder, reminder.departureAt - 1), "due");
  assert.equal(reminderPhase(reminder, reminder.departureAt), "expired");
});
test("restoring a reminder rejects corrupted, expired and previous-day data", () => {
  assert.deepEqual(
    readReminder(JSON.stringify(reminder), now.getTime()),
    reminder,
  );
  assert.equal(readReminder("broken", now.getTime()), null);
  assert.equal(
    readReminder(
      JSON.stringify({ ...reminder, departureAt: "bad" }),
      now.getTime(),
    ),
    null,
  );
  assert.equal(
    readReminder(
      JSON.stringify({ ...reminder, date: "2026-10-19" }),
      now.getTime(),
    ),
    null,
  );
  assert.equal(
    readReminder(JSON.stringify(reminder), reminder.departureAt),
    null,
  );
});
