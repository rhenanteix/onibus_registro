import { CalendarDays, ExternalLink } from "lucide-react";
import type { Holiday } from "@/types/transit";
import { weekdayNames } from "@/lib/domain";
import { holidayCalendar, holidaysOfYear, scopeLabels } from "@/lib/feriados";

function weekdayOf(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  return weekdayNames[date.getUTCDay()];
}

function entryKey(holiday: Holiday) {
  return `${holiday.date}|${holiday.scope}|${holiday.name}`;
}

export function HolidayCalendar({ today }: { today: string }) {
  const year = Number(today.slice(0, 4));
  const years = [year, year + 1];
  const items = years.flatMap((y) => holidaysOfYear(y));
  const todayKey = items.find((h) => h.date === today && h.type === "feriado");
  return (
    <details className="source-details">
      <summary>
        <CalendarDays size={14} /> Calendário de feriados e fontes
      </summary>
      <p>
        Base de {holidayCalendar.updatedAt}, conferida em cada item. Itens
        marcados como <strong>Feriado</strong> usam a grade de domingo/feriado.{" "}
        {todayKey
          ? `Hoje consta como ${todayKey.name.toLowerCase()} (${scopeLabels[todayKey.scope].toLowerCase()}).`
          : "Hoje não é feriado no calendário oficial."}
      </p>
      <ul className="holiday-list">
        {items.map((holiday) => (
          <li key={entryKey(holiday)}>
            <span className="holiday-date">{weekdayOf(holiday.date)}</span>
            <div>
              <strong>{holiday.name}</strong>
              <small>
                {holiday.date} · {scopeLabels[holiday.scope]} ·{" "}
                {holiday.type === "feriado" ? "Feriado" : "Ponto facultativo"}
                {holiday.status === "previsto" ? " · previsto" : ""}
              </small>
              {holiday.note && <small>{holiday.note}</small>}
              <a
                href={holiday.source}
                target="_blank"
                rel="noopener noreferrer"
                referrerPolicy="no-referrer"
              >
                {holiday.sourceLabel} <ExternalLink size={12} />
              </a>
            </div>
          </li>
        ))}
      </ul>
      <small className="muted">
        Datas com status “previsto” decorrem de lei permanente ou do calendário
        pascal e ainda não têm portaria ou decreto anual publicado. Feriados
        municipais de Registro foram conferidos na Lei Orgânica (art. 238), na
        Lei Municipal nº 1.248/2012, na Lei Municipal nº 595/1985 e nos decretos
        anuais da Prefeitura.
      </small>
    </details>
  );
}
