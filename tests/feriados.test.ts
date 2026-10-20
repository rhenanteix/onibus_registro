import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  gradeForLine,
  holidayCalendar,
  holidayOn,
  holidaysOfYear,
  holidaysOn,
  isHoliday,
  validateHolidayCalendar,
} from "../src/lib/feriados.ts";
import { saoPauloDateKey } from "../src/lib/domain.ts";

const raw = JSON.parse(
  readFileSync(new URL("../src/data/feriados.json", import.meta.url), "utf8"),
);

test("o calendário de feriados respeita o schema", () => {
  assert.deepEqual(validateHolidayCalendar(raw), []);
});

test("toda data tem fonte oficial e conferência registrada", () => {
  for (const holiday of holidayCalendar.holidays) {
    assert.match(holiday.source, /^https:\/\//, holiday.date);
    assert.ok(holiday.sourceLabel.length > 0, holiday.date);
    assert.ok(holiday.legalBasis.length > 0, holiday.date);
    assert.match(holiday.checkedAt, /^\d{4}-\d{2}-\d{2}$/, holiday.date);
  }
});

test("o schema rejeita calendário sem fonte, com data inválida ou repetida", () => {
  const invalido = {
    ...raw.holidays[0],
    source: "ftp://exemplo",
    date: "2026-02-30",
  };
  const broken = {
    ...raw,
    holidays: [invalido, { ...invalido }],
  };
  const errors = validateHolidayCalendar(broken);
  assert.ok(errors.some((e) => e.includes("date deve ser uma data real")));
  assert.ok(
    errors.some((e) => e.includes("source deve ser um endereço https")),
  );
  assert.ok(errors.some((e) => e.includes("repete outro item")));
});

test("os feriados municipais de Registro vêm de fonte oficial do município", () => {
  const municipal = holidayCalendar.holidays.filter(
    (h) => h.scope === "municipal",
  );
  assert.ok(municipal.length > 0);
  for (const holiday of municipal) {
    assert.match(holiday.source, /registro\.sp\.gov\.br/, holiday.date);
  }
  const dias = municipal
    .filter(
      (h) =>
        h.type === "feriado" &&
        h.status === "publicado" &&
        h.date.startsWith("2026"),
    )
    .map((h) => h.date);
  assert.deepEqual(dias, [
    "2026-04-03",
    "2026-06-04",
    "2026-11-30",
    "2026-12-03",
  ]);
});

test("a data magna do Estado de São Paulo é feriado estadual", () => {
  const state = holidaysOn("2026-07-09");
  assert.equal(state.length, 1);
  assert.equal(state[0].scope, "estadual");
  assert.equal(state[0].type, "feriado");
});

test("um feriado seleciona a grade de domingo e feriado", () => {
  const grade = gradeForLine(["week", "sat", "sun"], "2026-11-30");
  assert.equal(grade.day, "sun");
  assert.equal(grade.appliesHolidayGrade, true);
  assert.equal(grade.holiday?.name, "Emancipação do Município de Registro");
  assert.equal(grade.holiday?.scope, "municipal");
});

test("dia comum segue o dia da semana", () => {
  const grade = gradeForLine(["week", "sat", "sun"], "2026-10-20");
  assert.equal(grade.day, "week");
  assert.equal(grade.appliesHolidayGrade, false);
  assert.equal(grade.holiday, null);
});

test("linha sem grade de domingo mantém a grade do dia no feriado", () => {
  const grade = gradeForLine(["week"], "2026-11-30");
  assert.equal(grade.day, "week");
  assert.equal(grade.appliesHolidayGrade, false);
  assert.ok(grade.holiday);
});

test("ponto facultativo não troca a grade sozinho", () => {
  const grade = gradeForLine(["week", "sat", "sun"], "2026-02-16");
  assert.equal(grade.appliesHolidayGrade, false);
  assert.equal(grade.holiday?.type, "ponto_facultativo");
  assert.equal(isHoliday("2026-02-16"), false);
  assert.equal(isHoliday("2026-04-03"), true);
});

test("feriado municipal tem precedência sobre o nacional do mesmo dia", () => {
  const holiday = holidayOn("2026-04-03");
  assert.equal(holiday?.scope, "municipal");
  assert.equal(holiday?.name, "Paixão de Cristo");
});

test("o calendário cobre os dois anos seguintes com fonte em cada item", () => {
  const years = [
    ...new Set(holidayCalendar.holidays.map((h) => h.date.slice(0, 4))),
  ];
  assert.deepEqual(years, ["2026", "2027"]);
  assert.ok(holidaysOfYear(2026).length > 20);
  assert.ok(holidaysOfYear(2027).length > 20);
});

test("a data usada é a de São Paulo, não a da máquina", () => {
  // 2026-10-20 23:30 em São Paulo ainda é o dia 20; em UTC já seria o dia 21.
  const instant = new Date("2026-10-21T02:30:00Z");
  assert.equal(saoPauloDateKey(instant), "2026-10-20");
  assert.equal(holidayOn(saoPauloDateKey(instant)), null);
});

test("o catálogo servido inclui o calendário de feriados", () => {
  const repository = readFileSync(
    new URL("../src/server/transit-repository.ts", import.meta.url),
    "utf8",
  );
  assert.ok(repository.includes('from "@/data/feriados.json"'));
  assert.ok(repository.includes("holidays: feriados"));
});

test("a consulta offline sinaliza o feriado do dia", () => {
  const offline = readFileSync(
    new URL("../public/offline.js", import.meta.url),
    "utf8",
  );
  assert.ok(offline.includes("data.holidays?.holidays"));
  assert.ok(offline.includes("America/Sao_Paulo"));
});
