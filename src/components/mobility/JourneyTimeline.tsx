import { MapPin, ArrowUpRight } from "lucide-react";
import type { Journey, ReferencePoint, UserPosition } from "@/types/transit";
import { distanceMeters } from "@/lib/domain";
export function JourneyTimeline({
  journey,
  selected,
  onSelect,
  position,
}: {
  journey: Journey;
  selected: string | null;
  onSelect: (p: ReferencePoint) => void;
  position: UserPosition | null;
}) {
  return (
    <section>
      <div className="section-heading">
        <h3>
          <MapPin size={18} /> Por onde passa
        </h3>
        <span className="count">{journey.points.length} referências</span>
      </div>
      <p className="muted">
        Acompanhe a ordem do percurso. Ruas e bairros ainda não confirmam o
        local exato de embarque.
      </p>
      {journey.kind === "partial" && (
        <p className="notice">
          Sequência parcial: o itinerário completo ainda precisa ser validado.
        </p>
      )}
      <ol className="timeline">
        {journey.points.map((p) => (
          <li key={p.id} className={selected === p.id ? "point-selected" : ""}>
            <span className="sequence">{p.sequence}</span>
            <div>
              <strong>{p.label}</strong>
              <small>
                {p.position
                  ? "Localização aproximada"
                  : "Localização ainda não cadastrada"}
                {position && p.position
                  ? ` · ${(distanceMeters(position, p.position) / 1000).toFixed(1)} km de você em linha reta`
                  : ""}
              </small>
              {p.position && (
                <div className="point-actions">
                  <button onClick={() => onSelect(p)}>Ver no mapa</button>
                  <a
                    href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${p.position.lat},${p.position.lon}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver entorno <ArrowUpRight size={13} />
                  </a>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
      <p className="muted">
        O entorno abre um serviço externo; a existência e a data das imagens não
        são garantidas.
      </p>
    </section>
  );
}
