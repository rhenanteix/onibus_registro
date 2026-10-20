import { Clock3 } from "lucide-react";
import type { DayKey, Departure } from "@/types/transit";
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
}: {
  rows: Departure[];
  next: Departure | null;
  day: DayKey;
  onDay: (d: DayKey) => void;
  days: string[];
}) {
  return (
    <section className="timetable">
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
            </div>
          ))}
        </div>
      ) : (
        <p className="empty">
          Não há saídas publicadas para este dia e sentido.
        </p>
      )}
      <small className="muted">
        “?” indica informação pendente de confirmação. Feriados devem ser
        selecionados manualmente.
      </small>
    </section>
  );
}
