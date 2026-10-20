import { Clock3, Info, RotateCcw } from "lucide-react";
import type { DayKey, Departure, Holiday } from "@/types/transit";
import { scopeLabels } from "@/lib/feriados";
import { buildIssueUrl } from "@/lib/domain";
export const dayLabels: Record<DayKey, string> = {
  week: "Segunda a sexta",
  sat: "Sábado",
  sun: "Domingo / feriado",
  tuewedfri: "Terça, quarta e sexta",
};
export function Timetable({
  rows,
  next,
  day,
  onDay,
  days,
  autoDay,
  holiday,
  holidayGrade,
  onResetDay,
  lineId = "",
  directionLabel = "",
  sourceUrl = "",
  dataVersion = "",
}: {
  rows: Departure[];
  next: Departure | null;
  day: DayKey;
  onDay: (d: DayKey) => void;
  days: string[];
  autoDay: DayKey;
  holiday: Holiday | null;
  holidayGrade: boolean;
  onResetDay: () => void;
  lineId?: string;
  directionLabel?: string;
  sourceUrl?: string;
  dataVersion?: string;
}) {
  const manual = day !== autoDay;
  const isFeriado = holiday?.type === "feriado";
  return (
    <section>
      <div className="section-heading">
        <h3>
          <Clock3 size={18} /> Horários de saída
        </h3>
        <select
          aria-label="Dia da viagem"
          value={day}
          onChange={(e) => onDay(e.target.value as DayKey)}
        >
          {Array.from(new Set([...days, day])).map((d) => (
            <option key={d} value={d}>
              {dayLabels[d as DayKey]}
            </option>
          ))}
        </select>
      </div>
      <p className="muted">
        Saídas da origem da linha. Não são previsões de passagem neste ponto.
      </p>
      {holiday && isFeriado && holidayGrade && (
        <p className="notice notice-holiday" role="status">
          <Info size={16} /> Hoje é {holiday.name.toLowerCase()} (
          {scopeLabels[holiday.scope].toLowerCase()}). A grade de
          domingo/feriado foi selecionada automaticamente.
        </p>
      )}
      {holiday && isFeriado && !holidayGrade && (
        <p className="notice" role="status">
          <Info size={16} /> Hoje é {holiday.name.toLowerCase()} (
          {scopeLabels[holiday.scope].toLowerCase()}). Esta linha não publica
          grade de domingo/feriado, então a grade do dia foi mantida.
        </p>
      )}
      {holiday && !isFeriado && (
        <p className="notice" role="status">
          <Info size={16} /> Hoje é ponto facultativo (
          {holiday.name.toLowerCase()}). A grade não foi alterada
          automaticamente: confirme com a operadora.
        </p>
      )}
      {manual && (
        <p className="muted day-override">
          Seleção manual: {dayLabels[day].toLowerCase()}.{" "}
          <button onClick={onResetDay}>
            <RotateCcw size={12} /> Voltar à grade de hoje
          </button>
        </p>
      )}
      {rows.length ? (
        <div className="times">
          {rows.map((r, i) => (
            <div
              key={`${r.time}-${i}`}
              className={`time ${r === next ? "next-time" : ""} ${r.uncertain ? "uncertain" : ""}`}
            >
              <strong>
                {r.time}
                {r.uncertain ? " ?" : ""}
              </strong>
              {r.note && <small>{r.note}</small>}
              {r.variant !== "Padrão" && <small>{r.variant}</small>}
              <a
                className="report-link"
                aria-label={`Reportar erro no horário ${r.time}`}
                href={buildIssueUrl({
                  line: lineId,
                  direction: directionLabel,
                  day,
                  time: r.time,
                  dataVersion,
                  sourceUrl,
                })}
                target="_blank"
                rel="noopener noreferrer"
              >
                Reportar erro
              </a>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty">
          Não há saídas publicadas para este dia e sentido.
        </p>
      )}
      <small className="muted">
        “?” indica informação pendente de confirmação. Feriados são detectados
        pelo calendário oficial do portal; a seleção manual continua disponível.
      </small>
    </section>
  );
}
