import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Journey, LocationStatus } from "../src/types/transit.ts";
import {
  collectReferences,
  countByLine,
  locationStatusFor,
} from "../src/lib/references.ts";

const journeys = JSON.parse(
  readFileSync(new URL("../src/data/journeys.json", import.meta.url), "utf8"),
) as Record<string, Journey[]>;

const records = collectReferences(journeys);

test("toda referência informa a situação de sua localização", () => {
  const semCampo = records.filter((r) => !r.point.locationStatus);
  assert.deepEqual(
    semCampo.map((r) => r.point.id),
    [],
    "referência sem locationStatus",
  );
});

test("a situação gravada corresponde aos dados brutos", () => {
  for (const { point } of records) {
    assert.equal(point.locationStatus, locationStatusFor(point), point.id);
  }
});

test("referência sem coordenada continua na lista e não vira marcador", () => {
  const semLocalizacao = records.filter(
    (r) => r.point.locationStatus === "sem_localizacao",
  );
  assert.equal(semLocalizacao.length, 103);
  for (const { point } of semLocalizacao) {
    assert.equal(point.position, null);
    assert.equal(point.boardingValidated, false);
  }
  const rotos = journeys["L3"][0].points.find(
    (p) => p.label === "Pista Marginal Norte",
  );
  assert.ok(rotos, "Pista Marginal Norte continua no itinerário");
  assert.equal(rotos.locationStatus, "sem_localizacao");
  const br = records.find((r) => r.point.label === "BR116 S");
  assert.ok(br, "BR 116 continua no itinerário");
  assert.equal(br.point.locationStatus, "sem_localizacao");
  const brSimples = records.find((r) => r.point.label === "BR 116");
  assert.ok(brSimples, "BR 116 continua no itinerário");
  assert.equal(brSimples.point.locationStatus, "sem_localizacao");
});

test("nenhuma referência sem coordenada recebeu coordenada inventada", () => {
  for (const { point } of records) {
    if (point.locationStatus === "sem_localizacao") {
      assert.equal(point.position, null, point.id);
    }
    if (point.position) {
      assert.ok(Number.isFinite(point.position.lat), point.id);
      assert.ok(Number.isFinite(point.position.lon), point.id);
      assert.ok(
        point.position.lat >= -25 && point.position.lat <= -24,
        `${point.id} fora de Registro`,
      );
    }
  }
});

test("a contagem por linha bate com o total de referências", () => {
  const counts = countByLine(records);
  const total = counts.reduce((n, row) => n + row.total, 0);
  assert.equal(total, 404);
  assert.equal(counts.length, 15);
  for (const row of counts) {
    assert.equal(
      row.confirmada + row.aproximada + row.sem_localizacao,
      row.total,
      row.lineId,
    );
  }
  const r2 = counts.find((row) => row.lineId === "R2");
  assert.equal(r2?.sem_localizacao, 18);
});

test("as três situações do campo são as previstas", () => {
  const usadas = new Set<LocationStatus>(
    records.map((r) => r.point.locationStatus),
  );
  assert.deepEqual([...usadas].sort(), ["aproximada", "sem_localizacao"]);
});
