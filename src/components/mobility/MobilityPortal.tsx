"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
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
  destinationMatches,
  fuzzyIncludes,
  nextDeparture,
  saoPauloClock,
  saoPauloDateKey,
} from "@/lib/domain";
import { gradeForLine } from "@/lib/feriados";
import { locationStatusLabels } from "@/lib/references";
import { useGeolocation } from "@/hooks/useGeolocation";
import { nearbyReferences, departureInstant } from "@/lib/travel-assistance";
import { useDepartureReminder } from "@/hooks/useDepartureReminder";
import { useFavorites } from "@/hooks/useFavorites";
import { LineCard } from "./LineCard";
import { Timetable } from "./Timetable";
import { HolidayCalendar } from "./HolidayCalendar";
import { JourneyTimeline } from "./JourneyTimeline";
const TransitMap = dynamic(() => import("@/components/map/TransitMap"), {
  ssr: false,
  loading: () => <div className="map-loading">Abrindo mapa de Registro…</div>,
});
export function MobilityPortal({
  initialCatalog,
  initialDate,
}: {
  initialCatalog: Catalog;
  initialDate: string;
}) {
  const mapRegion = useRef<HTMLElement>(null);
  const detailHeading = useRef<HTMLHeadingElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [catalog, setCatalog] = useState(initialCatalog);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Todas");
  const [lineId, setLineId] = useState("L3");
  const [direction, setDirection] = useState(0);
  const [journeyId, setJourneyId] = useState("");
  const [recenter, setRecenter] = useState(0);
  const [showStops, setShowStops] = useState(false);
  const [mobileMap, setMobileMap] = useState(false);
  const [detail, setDetail] = useState(false);
  const [sync, setSync] = useState("");
  const geo = useGeolocation();
  const reminder = useDepartureReminder();
  const locatePending = useRef(false);
  const [nearbyMessage, setNearbyMessage] = useState("");
  const nearby = useMemo(
    () => (geo.position ? nearbyReferences(catalog, geo.position) : []),
    [catalog, geo.position],
  );
  useEffect(() => {
    if (!geo.position || !locatePending.current) return;
    if (geo.position.accuracy > 1000) {
      setNearbyMessage(
        "Precisão baixa. Aguarde uma localização melhor ou busque sua linha.",
      );
      return;
    }
    locatePending.current = false;
    setRecenter((value) => value + 1);
    const closest = nearby[0];
    if (closest) {
      setLineId(closest.lineId);
      setDirection(closest.journey.direction);
      setJourneyId(closest.journey.id);
      setDayOverride(null);
      setSelected(closest.point);
      setDetail(true);
      setQuery("");
      setFilter("Todas");
      setNearbyMessage(
        `Linha ${closest.lineId} sugerida perto de ${closest.point.label}. Confira o sentido antes de viajar.`,
      );
    } else {
      setNearbyMessage(
        geo.position.accuracy > 1000
          ? "Precisão baixa. Aguarde uma localização melhor ou busque sua linha."
          : "Não encontramos referências cadastradas a até 2 km. Busque uma linha pelo nome.",
      );
    }
  }, [geo.position, nearby]);
  function toggleLocation() {
    if (geo.active) {
      geo.stop();
      locatePending.current = false;
      setNearbyMessage("");
    } else {
      locatePending.current = true;
      setNearbyMessage("");
      geo.start();
    }
  }
  const { favorites, toggle } = useFavorites();

  const [today, setToday] = useState(initialDate);
  // null = grade automática (dia da semana ou feriado); um valor = escolha manual.
  const [dayOverride, setDayOverride] = useState<DayKey | null>(null);
  const [clock, setClock] = useState<number | null>(null);
  const [selected, setSelected] = useState<ReferencePoint | null>(null);
  const line = catalog.lines.find((l) => l.id === lineId) ?? catalog.lines[0];
  const grade = gradeForLine(line.dayKeys, today);
  const day: DayKey = dayOverride ?? grade.day;
  useEffect(() => {
    const tick = () => {
      setClock(saoPauloClock().minutes);
      setToday(saoPauloDateKey());
    };
    tick();
    const id = setInterval(tick, 30000);
    setDayOverride(null);
    return () => clearInterval(id);
  }, [line.id]);
  const journeys = (catalog.journeys[line.id] ?? []).filter(
    (j) => j.direction === direction,
  );
  const journey =
    journeys.find((j) => j.id === journeyId) ?? journeys[0] ?? null;
  const rows = catalog.schedules[line.id]?.[day]?.[direction] ?? [];
  const isToday = day === grade.day;
  const next = clock !== null && isToday ? nextDeparture(rows, clock) : null;
  const visible = useMemo(
    () =>
      catalog.lines.filter(
        (l) =>
          (filter === "Todas" ||
            (filter === "Favoritas" && favorites.includes(l.id)) ||
            l.kind === filter) &&
          (fuzzyIncludes(`${l.id} ${l.name} ${l.origins.join(" ")}`, query) ||
            destinationMatches(catalog.journeys[l.id] ?? [], query)),
      ),
    [catalog, query, filter, favorites],
  );
  function choose(id: string) {
    locatePending.current = false;
    setDayOverride(null);
    setLineId(id);
    setDirection(0);
    setJourneyId("");
    setSelected(null);
    setDetail(true);
    setMobileMap(false);
    requestAnimationFrame(() => detailHeading.current?.focus());
  }
  function openMap() {
    setMobileMap(true);
    requestAnimationFrame(() => mapRegion.current?.focus());
  }
  async function refresh() {
    if (refreshing) return;
    setRefreshing(true);
    setSync("Atualizando…");
    try {
      const response = await fetch("/api/catalog", { cache: "no-store" });
      if (!response.ok) throw Error();
      const body = await response.json();
      setCatalog(body.data);
      setSync(
        "Consulta concluída. Confira a data da fonte nos detalhes da linha.",
      );
    } catch {
      setSync("Não foi possível atualizar. Exibindo a base disponível.");
    } finally {
      setRefreshing(false);
    }
  }
  const origin = line.origins[direction] ?? "Consulte o itinerário";
  const destination = line.origins[direction === 0 ? 1 : 0] ?? line.name;
  return (
    <main
      id="conteudo"
      tabIndex={-1}
      className={`workspace ${mobileMap ? "mobile-map" : ""}`}
    >
      <section className="portal-intro" aria-label="Planeje sua viagem">
        <div>
          <span className="eyebrow">REGISTRO, SÃO PAULO</span>
          <h1>Encontre seu ônibus</h1>
        </div>
        <p>Linhas, horários de saída e percursos em um só lugar.</p>
        <Link className="intro-help" href="/como-usar">
          <Info size={17} /> Como usar
        </Link>
        <div className="location-assist">
          <div className="location-actions">
            <button
              className="location-entry"
              disabled={geo.active && !geo.position}
              onClick={() => {
                if (geo.position) {
                  setRecenter((value) => value + 1);
                  openMap();
                } else toggleLocation();
              }}
            >
              <LocateFixed size={21} />
              {geo.position
                ? "Ver onde estou"
                : geo.active
                  ? "Buscando localização…"
                  : "Encontrar ônibus perto de mim"}
            </button>
            {geo.active && (
              <button className="location-center" onClick={toggleLocation}>
                <X size={18} /> Desligar localização
              </button>
            )}
          </div>
          <div className="location-copy">
            <p className="geo-status" role="status">
              {geo.status}
              {geo.position
                ? ` · precisão de ${Math.round(geo.position.accuracy)} m`
                : " · permita o acesso para ver linhas próximas"}
            </p>
            {nearbyMessage && (
              <p className="nearby-message" role="status">
                {nearbyMessage}
              </p>
            )}
            {geo.position && (
              <button
                className="nearby-journey"
                onClick={() => {
                  setDetail(true);
                  setMobileMap(false);
                  requestAnimationFrame(() => detailHeading.current?.focus());
                }}
              >
                Ver horários e criar lembrete <ArrowRight size={16} />
              </button>
            )}
            {geo.position && nearby.length > 0 && (
              <div className="nearby-options" aria-label="Linhas próximas">
                {nearby.slice(0, 3).map((item) => (
                  <button
                    key={item.lineId}
                    aria-pressed={lineId === item.lineId}
                    onClick={() => {
                      choose(item.lineId);
                      setDirection(item.journey.direction);
                      setJourneyId(item.journey.id);
                      setSelected(item.point);
                    }}
                  >
                    <strong>{item.lineId}</strong> {Math.round(item.meters)} m
                    em linha reta
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {reminder.reminder && (
          <div className="reminder-status">
            <Bell size={18} />
            <span>
              Lembrete ativo:{" "}
              <strong>
                {reminder.reminder.lineId} · {reminder.reminder.time}
              </strong>
              . Mantenha a página aberta.
            </span>
            <button
              aria-label="Cancelar lembrete ativo"
              onClick={reminder.cancel}
            >
              Cancelar
            </button>
          </div>
        )}
        {reminder.alert && (
          <div className="departure-alert" role="alert">
            <Bell size={22} />
            <p>{reminder.alert}</p>
            <button
              className="icon-button"
              aria-label="Fechar aviso de saída"
              onClick={reminder.dismiss}
            >
              <X size={18} />
            </button>
          </div>
        )}
      </section>
      <aside
        aria-label="Buscar linhas de ônibus"
        className={`explorer ${detail ? "has-detail" : ""}`}
      >
        <div className="explorer-top">
          <span className="eyebrow">BUSQUE UMA LINHA</span>
          <h2>Qual é o seu destino?</h2>
          <p className="search-hint" id="search-help">
            Digite um bairro, destino ou número da linha.
          </p>
          <label className="search">
            <Search size={20} />
            <input
              ref={searchInput}
              type="search"
              aria-describedby="search-help"
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
          <div className="filters" role="group" aria-label="Filtrar linhas">
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
            <span role="status" aria-live="polite">
              {visible.length}{" "}
              {visible.length === 1 ? "linha encontrada" : "linhas encontradas"}
            </span>
            <button
              disabled={refreshing}
              aria-label="Consultar dados atualizados"
              onClick={refresh}
            >
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
            <div className="empty">
              <strong>
                {filter === "Favoritas" && !query
                  ? "Suas linhas favoritas ficam aqui"
                  : "Não encontramos uma linha"}
              </strong>
              <p>
                {filter === "Favoritas" && !query
                  ? "Toque na estrela ao lado de uma linha para salvá-la neste aparelho."
                  : "Tente outro bairro ou destino. Você também pode voltar à lista completa."}
              </p>
              <button
                className="primary"
                onClick={() => {
                  setQuery("");
                  setFilter("Todas");
                  searchInput.current?.focus();
                }}
              >
                Ver todas as linhas
              </button>
            </div>
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
        <button
          className="back-mobile"
          onClick={() => {
            setDetail(false);
            requestAnimationFrame(() => searchInput.current?.focus());
          }}
        >
          <ArrowLeft size={17} /> Todas as linhas
        </button>
        <div className="journey-header">
          <div className="journey-title">
            <span className="line-code">{line.id}</span>
            <div>
              <span className="eyebrow">{line.kind}</span>
              <h2 ref={detailHeading} tabIndex={-1}>
                {line.name}
              </h2>
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
            Escolha o percurso
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
                  : isToday
                    ? "Saídas de hoje"
                    : "Dia selecionado"}
              </small>
              <strong>
                {next
                  ? next.time
                  : clock === null
                    ? "Consultando horários…"
                    : isToday
                      ? rows.length
                        ? "Sem próxima saída confirmada"
                        : "Sem saídas publicadas"
                      : "Consulte os horários abaixo"}
              </strong>
            </div>
            {next && <span>na origem</span>}
          </div>
          <div className="reminder-card">
            <strong>
              <Bell size={17} /> Lembrete de saída
            </strong>
            <p>
              Avise 10 minutos antes da saída na origem. Não é o horário de
              chegada ao seu ponto.
            </p>
            {next && isToday && (
              <button
                className="primary"
                disabled={reminder.busy}
                onClick={() => {
                  const now = new Date();
                  const departureAt = departureInstant(next.time, now);
                  if (!departureAt) return;
                  void reminder.schedule({
                    id: `${line.id}-${direction}-${saoPauloDateKey(now)}-${next.time}`,
                    lineId: line.id,
                    origin,
                    destination,
                    time: next.time,
                    date: saoPauloDateKey(now),
                    departureAt,
                  });
                }}
              >
                <Bell size={17} />
                {reminder.busy
                  ? "Solicitando permissão…"
                  : "Lembrar desta saída"}
              </button>
            )}
            {!next && (
              <p>Escolha uma saída futura de hoje para ativar o lembrete.</p>
            )}
            {reminder.reminder && (
              <div className="reminder-active">
                <p>
                  Lembrete ativo:{" "}
                  <strong>
                    {reminder.reminder.lineId} · {reminder.reminder.time}
                  </strong>
                  , de {reminder.reminder.origin} para{" "}
                  {reminder.reminder.destination}.
                </p>
                <button onClick={reminder.cancel}>Cancelar lembrete</button>
              </div>
            )}
            <p role="status">{reminder.message}</p>
            <small>
              Se faltarem menos de 10 minutos, o aviso aparece em até 15
              segundos. Mantenha esta página aberta e ativa. Com o site fechado,
              o celular bloqueado ou o navegador suspenso, este lembrete não é
              garantido.
            </small>
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
            onDay={setDayOverride}
            days={line.dayKeys}
            autoDay={grade.day}
            holiday={grade.holiday}
            holidayGrade={grade.appliesHolidayGrade}
            onResetDay={() => setDayOverride(null)}
            lineId={line.id}
            directionLabel={journey?.label ?? ""}
            sourceUrl={line.source}
            dataVersion={line.verifiedAt}
          />
          {journey ? (
            <JourneyTimeline
              journey={journey}
              selected={selected?.id ?? null}
              position={geo.position}
              onSelect={(p) => {
                setSelected(p);
                openMap();
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
            <a
              href={line.source}
              target="_blank"
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
            >
              Abrir fonte pública
            </a>
            <pre>{line.text}</pre>
          </details>
          <HolidayCalendar today={today} />
        </div>
      </section>
      <section
        ref={mapRegion}
        tabIndex={-1}
        className="map-panel"
        aria-label="Mapa do percurso"
      >
        <div className="map-heading">
          <div>
            <span className="eyebrow">MAPA DO PERCURSO</span>
            <h2>
              <span className="line-code">{line.id}</span> {destination}
            </h2>
          </div>
          <button
            className="map-control"
            disabled={!geo.position}
            onClick={() => setRecenter((x) => x + 1)}
            aria-label="Centralizar minha localização"
            title="Centralizar minha localização"
          >
            <LocateFixed size={20} />
          </button>
        </div>
        <div className="map-canvas">
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
        </div>
        <div className="map-tools">
          <label className="map-reference-picker">
            Encontrar uma referência no mapa
            <select
              value={selected?.id ?? ""}
              onChange={(event) =>
                setSelected(
                  journey?.points.find(
                    (point) => point.id === event.target.value,
                  ) ?? null,
                )
              }
            >
              <option value="">Selecione uma rua ou local</option>
              {journey?.points
                .filter((point) => point.position)
                .map((point) => (
                  <option key={point.id} value={point.id}>
                    {point.sequence}. {point.label}
                  </option>
                ))}
            </select>
          </label>
          {selected && (
            <div className="selected-place" role="status">
              <button
                className="icon-button"
                onClick={() => setSelected(null)}
                aria-label="Fechar referência"
              >
                <X size={17} />
              </button>
              <strong>
                {selected.sequence}. {selected.label}
              </strong>
              <p>
                {locationStatusLabels[selected.locationStatus]}. Embarque não
                confirmado.
              </p>
            </div>
          )}
          <details className="map-legend">
            <summary>Sobre as informações do mapa</summary>
            <p>
              A linha tracejada é um trajeto aproximado. Os números indicam
              referências do percurso, não a posição dos ônibus.
            </p>
            <label>
              <input
                type="checkbox"
                checked={showStops}
                onChange={(e) => setShowStops(e.target.checked)}
              />{" "}
              Mostrar outros locais do OpenStreetMap
            </label>
            <small>Esses locais não têm embarque confirmado nesta linha.</small>
          </details>
          <p className="map-bottom">
            <Navigation size={16} />
            <span>
              {geo.position
                ? `Você está no ponto azul · precisão de ${Math.round(geo.position.accuracy)} m`
                : "Mapa de referência · sem localização ao vivo dos ônibus"}
            </span>
          </p>
        </div>
      </section>
      <button
        className="mobile-toggle"
        aria-pressed={mobileMap}
        onClick={() => {
          if (mobileMap) {
            setMobileMap(false);
            requestAnimationFrame(() => {
              if (detail) detailHeading.current?.focus();
              else searchInput.current?.focus();
            });
          } else openMap();
        }}
      >
        {mobileMap ? (
          <>
            <BusFront size={18} /> Ver linhas e percurso
          </>
        ) : (
          <>
            <Map size={18} /> Ver mapa
          </>
        )}
      </button>
    </main>
  );
}
