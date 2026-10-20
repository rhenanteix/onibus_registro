import { MapPin, ArrowUpRight } from "lucide-react";
import type { Journey, ReferencePoint, UserPosition } from "@/types/transit";
import { distanceMeters } from "@/lib/domain";
import {
  locationStatusLabels,
  locationStatusShortLabels,
} from "@/lib/references";
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
              <span className="point-status" data-status={p.locationStatus}>
                {locationStatusShortLabels[p.locationStatus]}
              </span>
              <small>
                {locationStatusLabels[p.locationStatus]}
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
                    rel="noopener noreferrer"
                    referrerPolicy="no-referrer"
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
        Referências sem coordenada ficam na lista e não recebem marcador no
        mapa. “Ver entorno” abre um serviço externo de imagens (Google Maps) e
        só é acessado se você clicar no link; o portal não carrega imagem de
        terceiros.
      </p>
    </section>
  );
}
