import raw from "../data/feriados.json" with { type: "json" };
import type {
  DayKey,
  Holiday,
  HolidayCalendar,
  HolidayScope,
  HolidayStatus,
  HolidayType,
} from "../types/transit.ts";
import { dateFromKey, dayForLine } from "./domain.ts";

export const holidayCalendar = raw as unknown as HolidayCalendar;

const SCOPES: HolidayScope[] = ["nacional", "estadual", "municipal"];
const TYPES: HolidayType[] = ["feriado", "ponto_facultativo"];
const STATUSES: HolidayStatus[] = ["publicado", "previsto"];

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function isRealDate(value: string) {
  if (!DATE.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Validação do schema de src/data/feriados.json.
 * Devolve a lista de problemas; lista vazia significa calendário válido.
 * A mesma rotina roda no teste de integridade e na carga do servidor.
 */
export function validateHolidayCalendar(data: unknown): string[] {
  const errors: string[] = [];
  if (typeof data !== "object" || data === null) {
    return ["calendário ausente ou não é um objeto"];
  }
  const calendar = data as Partial<HolidayCalendar>;
  if (calendar.version !== 1) errors.push("version deve ser 1");
  if (!isText(calendar.updatedAt) || !DATE.test(calendar.updatedAt)) {
    errors.push("updatedAt deve estar em AAAA-MM-DD");
  }
  if (!isText(calendar.municipality)) errors.push("municipality ausente");
  if (!isText(calendar.state)) errors.push("state ausente");
  if (calendar.timezone !== "America/Sao_Paulo") {
    errors.push("timezone deve ser America/Sao_Paulo");
  }
  if (!isText(calendar.notes)) errors.push("notes ausente");
  if (!Array.isArray(calendar.holidays) || !calendar.holidays.length) {
    errors.push("holidays deve ser uma lista não vazia");
    return errors;
  }
  const seen = new Set<string>();
  calendar.holidays.forEach((holiday, index) => {
    const at = `holidays[${index}]`;
    if (typeof holiday !== "object" || holiday === null) {
      errors.push(`${at} não é um objeto`);
      return;
    }
    const h = holiday as Partial<Holiday>;
    if (!isText(h.date) || !isRealDate(h.date)) {
      errors.push(`${at}.date deve ser uma data real em AAAA-MM-DD`);
    }
    if (!isText(h.name)) errors.push(`${at}.name ausente`);
    if (!h.scope || !SCOPES.includes(h.scope)) {
      errors.push(`${at}.scope deve ser nacional, estadual ou municipal`);
    }
    if (!h.type || !TYPES.includes(h.type)) {
      errors.push(`${at}.type deve ser feriado ou ponto_facultativo`);
    }
    if (!h.status || !STATUSES.includes(h.status)) {
      errors.push(`${at}.status deve ser publicado ou previsto`);
    }
    if (!isText(h.source) || !/^https:\/\/\S+$/.test(h.source)) {
      errors.push(`${at}.source deve ser um endereço https`);
    }
    if (!isText(h.sourceLabel)) errors.push(`${at}.sourceLabel ausente`);
    if (!isText(h.legalBasis)) errors.push(`${at}.legalBasis ausente`);
    if (!isText(h.checkedAt) || !DATE.test(h.checkedAt)) {
      errors.push(`${at}.checkedAt deve estar em AAAA-MM-DD`);
    }
    if (h.note !== undefined && !isText(h.note)) {
      errors.push(`${at}.note deve ser texto quando presente`);
    }
    const key = `${h.date}|${h.scope}|${h.name}`;
    if (seen.has(key)) errors.push(`${at} repete outro item do calendário`);
    seen.add(key);
  });
  return errors;
}

const byDate = new Map<string, Holiday[]>();
for (const holiday of holidayCalendar.holidays) {
  const list = byDate.get(holiday.date) ?? [];
  list.push(holiday);
  byDate.set(holiday.date, list);
}

const scopeWeight: Record<HolidayScope, number> = {
  municipal: 3,
  estadual: 2,
  nacional: 1,
};

/** Todos os itens de uma data, do mais próximo (municipal) ao mais geral. */
export function holidaysOn(dateKey: string): Holiday[] {
  return (byDate.get(dateKey) ?? [])
    .slice()
    .sort((a, b) => scopeWeight[b.scope] - scopeWeight[a.scope]);
}

/** O item que representa a data: feriado municipal/estadual/nacional, na ordem. */
export function holidayOn(dateKey: string): Holiday | null {
  const list = holidaysOn(dateKey);
  return list.find((h) => h.type === "feriado") ?? list[0] ?? null;
}

/** Verdadeiro quando a data é feriado (não apenas ponto facultativo). */
export function isHoliday(dateKey: string): boolean {
  return holidaysOn(dateKey).some((h) => h.type === "feriado");
}

/** Feriados de um ano, em ordem de data. */
export function holidaysOfYear(year: number): Holiday[] {
  return holidayCalendar.holidays
    .filter((h) => h.date.startsWith(`${year}-`))
    .sort((a, b) =>
      a.date === b.date
        ? scopeWeight[b.scope] - scopeWeight[a.scope]
        : a.date.localeCompare(b.date),
    );
}

export const scopeLabels: Record<HolidayScope, string> = {
  nacional: "Nacional",
  estadual: "Estadual (SP)",
  municipal: "Municipal (Registro)",
};

export const holidayTypeLabels: Record<HolidayType, string> = {
  feriado: "Feriado",
  ponto_facultativo: "Ponto facultativo",
};

/** Texto curto para a interface: "20/11/2026 (sexta-feira)". */
export function formatHolidayDate(dateKey: string, weekdays: string[]) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = weekdays[date.getUTCDay()] ?? "";
  return `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}/${year} (${weekday})`;
}

/**
 * Grade do dia para uma linha.
 * Em feriado, aplica a grade "Domingo / feriado" quando a linha publica uma.
 * A escolha manual do usuário tem precedência e é tratada na interface.
 */
export function gradeForLine(
  dayKeys: string[],
  dateKey: string,
): { day: DayKey; holiday: Holiday | null; appliesHolidayGrade: boolean } {
  const holiday = holidayOn(dateKey);
  const isFeriado = isHoliday(dateKey);
  if (isFeriado && holiday && dayKeys.includes("sun")) {
    return { day: "sun", holiday, appliesHolidayGrade: true };
  }
  return {
    day: dayForLine(dayKeys, dateFromKey(dateKey)),
    holiday,
    appliesHolidayGrade: false,
  };
}
