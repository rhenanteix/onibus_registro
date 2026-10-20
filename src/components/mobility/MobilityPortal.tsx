"use client";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  LocateFixed,
  ArrowLeft,
  ArrowRight,
  ArrowLeftRight,
  Map,
  Star,
  BusFront,
  Info,
  Navigation,
  X,
  RefreshCw,
} from "lucide-react";
import type { Catalog, DayKey, ReferencePoint } from "@/types/transit";
import {
  dayForLine,
  destinationMatches,
  nextDeparture,
  normalize,
  saoPauloClock,
} from "@/lib/domain";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useFavorites } from "@/hooks/useFavorites";
import { LineCard } from "./LineCard";
import { Timetable } from "./Timetable";
import { JourneyTimeline } from "./JourneyTimeline";
const TransitMap = dynamic(() => import("@/components/map/TransitMap"), {
  ssr: false,
  loading: () => <div className="map-loading">Abrindo mapa de Registro…</div>,
});
export function MobilityPortal({
  initialCatalog,
}: {
  initialCatalog: Catalog;
}) {
  const [catalog, setCatalog] = useState(initialCatalog);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Todas");
  const [lineId, setLineId] = useState("L3");
  const [direction, setDirection] = useState(0);
  const [journeyId, setJourneyId] = useState("");
  const [day, setDay] = useState<DayKey>("week");
  const [clock, setClock] = useState<number | null>(null);
  const [selected, setSelected] = useState<ReferencePoint | null>(null);
  const [recenter, setRecenter] = useState(0);
  const [showStops, setShowStops] = useState(false);
  const [mobileMap, setMobileMap] = useState(false);
  const [detail, setDetail] = useState(false);
  const [sync, setSync] = useState("");
  const geo = useGeolocation();
  const { favorites, toggle } = useFavorites();
  const line = catalog.lines.find((l) => l.id === lineId) ?? catalog.lines[0];
  useEffect(() => {
    const tick = () => setClock(saoPauloClock().minutes);
    tick();
    const id = setInterval(tick, 30000);
    setDay(dayForLine(line.dayKeys));
    return () => clearInterval(id);
  }, [line.id]);
  const journeys = (catalog.journeys[line.id] ?? []).filter(
    (j) => j.direction === direction,
  );
  const journey =
    journeys.find((j) => j.id === journeyId) ?? journeys[0] ?? null;
  const rows = catalog.schedules[line.id]?.[day]?.[direction] ?? [];
  const today = day === dayForLine(line.dayKeys);
  const next = clock !== null && today ? nextDeparture(rows, clock) : null;
  const visible = useMemo(
    () =>
      catalog.lines.filter(
        (l) =>
          (filter === "Todas" ||
            (filter === "Favoritas" && favorites.includes(l.id)) ||
            l.kind === filter) &&
          (normalize(`${l.id} ${l.name} ${l.origins.join(" ")}`).includes(
            normalize(query),
          ) ||
            destinationMatches(catalog.journeys[l.id] ?? [], query)),
      ),
    [catalog, query, filter, favorites],
  );
  function choose(id: string) {
    setLineId(id);
    setDirection(0);
    setJourneyId("");
    setSelected(null);
    setDetail(true);
    setMobileMap(false);
  }
  async function refresh() {
    setSync("Atualizando…");
    try {
      const response = await fetch("/api/catalog", { cache: "no-store" });
      if (!response.ok) throw Error();
      const body = await response.json();
      setCatalog(body.data);
      setSync("Dados consultados. Base de 20/10/2026.");
    } catch {
      setSync("Sem conexão. Exibindo a base disponível.");
    }
  }
  const origin = line.origins[direction] ?? "Consulte o itinerário";
  const destination = line.origins[direction === 0 ? 1 : 0] ?? line.name;
  return (
    <main
      id="conteudo"
      className={`workspace ${mobileMap ? "mobile-map" : ""}`}
    >
      <aside className={`explorer ${detail ? "has-detail" : ""}`}>
        <div className="explorer-top">
          <span className="eyebrow">REGISTRO, SÃO PAULO</span>
          <h1>
            Qual é o seu
            <br />
            próximo caminho?
          </h1>
          <label className="search">
            <Search size={20} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Destino, bairro ou linha"
              aria-label="Buscar destino, bairro ou linha"
            />
            {query && (
              <button aria-label="Limpar busca" onClick={() => setQuery("")}>
                <X size={16} />
              </button>
            )}
          </label>
          <button
            className="location-entry"
            onClick={() => (geo.active ? geo.stop() : geo.start())}
          >
            <LocateFixed size={18} />
            {geo.active
              ? "Desligar minha localização"
              : "Usar minha localização"}
            <ArrowRight size={16} />
          </button>
          <p className="geo-status" role="status">
            {geo.status}
          </p>
          <div className="filters" aria-label="Filtrar linhas">
            {["Todas", "Urbana", "Rural", "Universitária", "Favoritas"].map(
              (f) => (
                <button
                  key={f}
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                >
                  {f === "Favoritas" && <Star size={13} />} {f}
                </button>
              ),
            )}
          </div>
        </div>
        <div className="line-list">
          <div className="list-label">
            <span>{visible.length} linhas disponíveis</span>
            <button aria-label="Consultar dados atualizados" onClick={refresh}>
              <RefreshCw size={14} />
            </button>
          </div>
          {sync && (
            <p className="muted" role="status">
              {sync}
            </p>
          )}
          {visible.map((l) => (
            <LineCard
              key={l.id}
              line={l}
              selected={l.id === lineId}
              favorite={favorites.includes(l.id)}
              onSelect={() => choose(l.id)}
              onFavorite={() => toggle(l.id)}
            />
          ))}
          {!visible.length && (
            <p className="empty">
              Nenhuma linha encontrada. Tente o nome de outro bairro ou limpe o
              filtro.
            </p>
          )}
        </div>
        <div className="explorer-foot">
          <span className="status-dot" /> Horários publicados · sem GPS da frota
        </div>
      </aside>
      <section
        className={`journey-panel ${detail ? "detail-open" : ""}`}
        aria-label="Detalhes da viagem"
      >
        <button className="back-mobile" onClick={() => setDetail(false)}>
          <ArrowLeft size={17} /> Todas as linhas
        </button>
        <div className="journey-header">
          <div className="journey-title">
            <span className="line-code">{line.id}</span>
            <div>
              <span className="eyebrow">{line.kind}</span>
              <h2>{line.name}</h2>
            </div>
            <button
              className="icon-button"
              aria-label="Alternar favorito"
              aria-pressed={favorites.includes(line.id)}
              onClick={() => toggle(line.id)}
            >
              <Star
                size={21}
                fill={favorites.includes(line.id) ? "currentColor" : "none"}
              />
            </button>
          </div>
          <div className="destination">
            <span>
              <small>SAINDO DE</small>
              <strong>{origin}</strong>
            </span>
            <ArrowRight size={20} />
            <span>
              <small>EM DIREÇÃO A</small>
              <strong>{destination}</strong>
            </span>
          </div>
          <button
            className="direction-button"
            onClick={() => {
              setDirection((d) => (d === 0 ? 1 : 0));
              setJourneyId("");
              setSelected(null);
            }}
          >
            <ArrowLeftRight size={17} /> Inverter sentido
          </button>
          <label className="variant-label">
            Percurso / variante
            <select
              value={journey?.id ?? ""}
              onChange={(e) => {
                setJourneyId(e.target.value);
                setSelected(null);
              }}
            >
              {journeys.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.label}
                </option>
              ))}
              {!journeys.length && (
                <option value="">Sem sequência cadastrada neste sentido</option>
              )}
            </select>
          </label>
          <div className="departure-summary">
            <BusFront size={22} />
            <div>
              <small>
                {next
                  ? "Próxima saída publicada"
                  : today
                    ? "Saídas de hoje"
                    : "Dia selecionado"}
              </small>
              <strong>
                {next
                  ? next.time
                  : today
                    ? "Consulte a grade"
                    : "Consulte os horários abaixo"}
              </strong>
            </div>
            <span>na origem</span>
          </div>
          <p className="notice">
            <Info size={16} /> Percurso em validação. Confirme o embarque com a
            operadora. A variante escolhida mostra o itinerário; os horários
            abaixo preservam suas próprias notas.
          </p>
        </div>
        <div className="journey-content">
          <Timetable
            rows={rows}
            next={next}
            day={day}
            onDay={setDay}
            days={line.dayKeys}
          />
          {journey ? (
            <JourneyTimeline
              journey={journey}
              selected={selected?.id ?? null}
              position={geo.position}
              onSelect={(p) => {
                setSelected(p);
                setMobileMap(true);
              }}
            />
          ) : (
            <p className="empty">
              Este sentido não tem sequência publicada na base.
            </p>
          )}
          <details className="source-details">
            <summary>Fonte, vigência e texto publicado</summary>
            <p>
              Conferência documental: {line.verifiedAt}. Vigência operacional
              ainda não confirmada.
            </p>
            <a href={line.source} target="_blank" rel="noreferrer">
              Abrir fonte pública
            </a>
            <pre>{line.text}</pre>
          </details>
        </div>
      </section>
      <section className="map-panel" aria-label="Mapa do percurso">
        <TransitMap
          journey={journey}
          shape={catalog.routes[line.id] ?? null}
          selected={selected}
          position={geo.position}
          stops={catalog.stops}
          showStops={showStops}
          onSelect={setSelected}
          recenter={recenter}
        />
        <div className="map-heading">
          <span className="map-tag">
            <span className="status-dot" />
            {line.id} · {destination}
          </span>
          <button
            className="map-control"
            disabled={!geo.position}
            onClick={() => setRecenter((x) => x + 1)}
            aria-label="Centralizar minha localização"
          >
            <LocateFixed size={20} />
          </button>
        </div>
        <div className="map-legend">
          <span>
            <i /> Traçado aproximado
          </span>
          <span>
            <b>1</b> Referências do percurso
          </span>
          <label>
            <input
              type="checkbox"
              checked={showStops}
              onChange={(e) => setShowStops(e.target.checked)}
            />{" "}
            Locais OSM sem vínculo de linha
          </label>
        </div>
        {selected && (
          <div className="selected-place">
            <button
              className="icon-button"
              onClick={() => setSelected(null)}
              aria-label="Fechar referência"
            >
              <X size={17} />
            </button>
            <small>REFERÊNCIA {selected.sequence}</small>
            <strong>{selected.label}</strong>
            <p>Localização aproximada. Ponto de embarque não confirmado.</p>
          </div>
        )}
        <div className="map-bottom">
          <Navigation size={18} />
          <span>
            {geo.position
              ? `Sua localização · precisão de ${Math.round(geo.position.accuracy)} m`
              : "Ative sua localização para se orientar no mapa."}
          </span>
        </div>
      </section>
      <button className="mobile-toggle" onClick={() => setMobileMap((v) => !v)}>
        {mobileMap ? (
          <>
            <BusFront size={18} /> Ver linhas e percurso
          </>
        ) : (
          <>
            <Map size={18} /> Abrir mapa
          </>
        )}
      </button>
    </main>
  );
}
