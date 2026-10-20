import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  nextDeparture,
  dayForLine,
  saoPauloClock,
  parseSourceTime,
} from "../src/lib/domain.ts";
import type { Departure } from "../src/types/transit.ts";
const read = (name: string) =>
  JSON.parse(
    readFileSync(new URL(`../src/data/${name}.json`, import.meta.url), "utf8"),
  );

test("parseSourceTime normaliza todos os formatos reais da fonte", () => {
  const casos: Array<[string, Partial<ParsedCase>]> = [
    ["06h55", { time: "06:55", note: "", uncertain: false }],
    ["07:55", { time: "07:55", note: "", uncertain: false }],
    ["07h55 (extra)", { time: "07:55", note: "extra", uncertain: false }],
    ["07h55(extra)", { time: "07:55", note: "extra", uncertain: false }],
    ["07h50?", { time: "07:50", note: "", uncertain: true }],
    ["07h50?– 08h55", { time: "07:50", note: "", uncertain: true }],    ["07h30(Direto)", { time: "07:30", note: "Direto", uncertain: false }],
    ["07h30 (Direto)", { time: "07:30", note: "Direto", uncertain: false }],
    ["07h15(extra Via Castelinho)", {
      time: "07:15",
      note: "extra Via Castelinho",
      uncertain: false,
    }],
    ["11h:55", { time: "11:55", note: "", uncertain: false }],
    ["20:10", { time: "20:10", note: "", uncertain: false }],
    ["05H00", { time: "05:00", note: "", uncertain: false }],
    ["07:00", { time: "07:00", note: "", uncertain: false }],
    ["18h45", { time: "18:45", note: "", uncertain: false }],
    ["15h25?", { time: "15:25", note: "", uncertain: true }],
    ["17h30 ?", { time: "17:30", note: "", uncertain: true }],
  ];
  for (const [raw, esperado] of casos) {
    const parsed = parseSourceTime(raw);
    assert.ok(parsed, `não parseou: ${raw}`);
    assert.equal(parsed!.raw, raw, `raw de ${raw}`);
    assert.equal(parsed!.time, esperado.time, `time de ${raw}`);
    assert.equal(parsed!.note, esperado.note, `note de ${raw}`);
    assert.equal(parsed!.uncertain, esperado.uncertain, `uncertain de ${raw}`);
    assert.equal(parsed!.variant, "Padrão", `variant de ${raw}`);
  }
});

interface ParsedCase {
  time: string;
  note: string;
  uncertain: boolean;
}

test("parseSourceTime não inventa horário onde não há token", () => {
  assert.equal(parseSourceTime("Itinerário: Rua X – Rua Y"), null);
  assert.equal(parseSourceTime(""), null);
});

test("parseSourceTime rejeita horário fora do alcance e preserva o texto", () => {
  assert.throws(() => parseSourceTime("25:00"), /fora do alcance/);
  assert.throws(() => parseSourceTime("07h60"), /fora do alcance/);
});

test("L3 útil: próxima saída existe durante o dia e some após a última", () => {
  const schedules = read("schedules");
  const rows: Departure[] = schedules.L3.week[0];
  assert.equal(rows.at(-1)?.time, "23:00");
  assert.equal(nextDeparture(rows, 16 * 60 + 41)?.time, "17:15");
  assert.equal(nextDeparture(rows, 22 * 60 + 39)?.time, "22:40");
  assert.equal(nextDeparture(rows, 23 * 60 + 0)?.time, "23:00");
  // Depois da última publicação não há próxima saída hoje: "Consulte a grade".
  assert.equal(nextDeparture(rows, 23 * 60 + 1), null);
  assert.equal(nextDeparture(rows, 23 * 60 + 59), null);
});

test("após a meia-noite a próxima saída é a primeira do mesmo dia útil", () => {
  const schedules = read("schedules");
  const rows: Departure[] = schedules.L3.week[0];
  assert.equal(nextDeparture(rows, 0)?.time, "06:55");
  assert.equal(nextDeparture(rows, 1)?.time, "06:55");
  assert.equal(nextDeparture(rows, 6 * 60 + 54)?.time, "06:55");
});

test("saídas incertas da fonte nunca são a próxima saída", () => {
  const schedules = read("schedules");
  const sabado: Departure[] = schedules.L3.sat[0];
  const incerta = sabado.find((d) => d.uncertain);
  assert.ok(incerta);
  assert.equal(incerta?.time, "07:50");
  assert.equal(nextDeparture(sabado, 7 * 60 + 49)?.time, "07:55");
  assert.equal(nextDeparture(sabado, 7 * 60 + 50)?.time, "07:55");
});

test("dia da linha segue o fuso de Sao Paulo na virada de dia", () => {
  const keys = ["week", "sat", "sun"];
  // Quinta-feira 23:00 em Sao Paulo (2026-10-22T02:00Z)
  assert.equal(dayForLine(keys, new Date("2026-10-22T02:00:00Z")), "week");
  // Sexta-feira 23:59 em Sao Paulo (2026-10-24T02:59Z) ainda e util
  assert.equal(dayForLine(keys, new Date("2026-10-24T02:59:00Z")), "week");
  // Sabado 00:01 em Sao Paulo (2026-10-24T03:00Z)
  assert.equal(dayForLine(keys, new Date("2026-10-24T03:00:00Z")), "sat");
  // Sabado 23:59 em Sao Paulo (2026-10-25T02:59:00Z)
  assert.equal(dayForLine(keys, new Date("2026-10-25T02:59:00Z")), "sat");
  // Domingo 00:01 em Sao Paulo (2026-10-25T03:01Z)
  assert.equal(dayForLine(keys, new Date("2026-10-25T03:01:00Z")), "sun");
  // Segunda 00:01 em Sao Paulo (2026-10-26T03:01Z)
  assert.equal(dayForLine(keys, new Date("2026-10-26T03:01:00Z")), "week");
});

test("saoPauloClock é America/Sao_Paulo independente do fuso da máquina", () => {
  // 2026-10-20T19:41:37Z = 16:41 em Sao Paulo (UTC-3, sem horario de verao)
  const c = saoPauloClock(new Date("2026-10-20T19:41:37Z"));
  assert.equal(c.minutes, 16 * 60 + 41);
  assert.equal(c.day, "week");
});
