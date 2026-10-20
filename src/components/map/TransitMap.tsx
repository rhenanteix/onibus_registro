"use client";
import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  Tooltip,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type {
  Journey,
  RouteShape,
  ReferencePoint,
  UserPosition,
  MappedStop,
} from "@/types/transit";
import { routeColor } from "@/lib/domain";
import { locationStatusLabels } from "@/lib/references";
interface Props {
  journey: Journey | null;
  shape: RouteShape | null;
  selected: ReferencePoint | null;
  position: UserPosition | null;
  stops: MappedStop[];
  showStops: boolean;
  onSelect: (p: ReferencePoint) => void;
  recenter: number;
}
function View({
  journey,
  selected,
  position,
  recenter,
}: {
  journey: Journey | null;
  selected: ReferencePoint | null;
  position: UserPosition | null;
  recenter: number;
}) {
  const map = useMap();
  const currentPosition = useRef(position);
  useEffect(() => {
    currentPosition.current = position;
  }, [position]);
  const lastRecenter = useRef(0);
  useEffect(() => {
    // One camera update per render: a nearby reference must not override "where I am".
    map.stop();
    const location = currentPosition.current;
    if (location && recenter > lastRecenter.current) {
      lastRecenter.current = recenter;
      map.setView([location.lat, location.lon], 16, { animate: false });
      return;
    }
    if (selected?.position) {
      map.setView([selected.position.lat, selected.position.lon], 17, {
        animate: false,
      });
      return;
    }
    const points =
      journey?.points
        .filter((point) => point.position)
        .map(
          (point) =>
            [point.position!.lat, point.position!.lon] as [number, number],
        ) ?? [];
    if (points.length)
      map.fitBounds(points, { padding: [45, 45], maxZoom: 15, animate: false });
  }, [journey, selected, recenter, map]);
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}
export default function TransitMap({
  journey,
  shape,
  selected,
  position,
  stops,
  showStops,
  onSelect,
  recenter,
}: Props) {
  const variant =
    journey?.kind === "regular"
      ? shape?.variants.find((v) => v.direction === journey.direction)
      : null;
  const color = routeColor(journey?.lineId ?? "L");
  const grouped = new Map<string, ReferencePoint[]>();
  journey?.points.forEach((p) => {
    if (p.position) {
      const key = `${p.position.lat},${p.position.lon}`;
      grouped.set(key, [...(grouped.get(key) ?? []), p]);
    }
  });
  return (
    <MapContainer
      center={[-24.493, -47.843]}
      zoom={14}
      className="transit-map"
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <View
        journey={journey}
        selected={selected}
        position={position}
        recenter={recenter}
      />
      {variant && (
        <Polyline
          positions={variant.geometry.coordinates.map(([lon, lat]) => [
            lat,
            lon,
          ])}
          pathOptions={{ color, weight: 5, opacity: 0.8, dashArray: "10 9" }}
        />
      )}
      {Array.from(grouped.entries()).map(([key, points]) => (
        <Marker
          key={key}
          title={points.map((p) => `${p.sequence}. ${p.label}`).join(", ")}
          alt={points.map((p) => p.label).join(", ")}
          position={[points[0].position!.lat, points[0].position!.lon]}
          icon={L.divIcon({
            className: "reference-marker",
            html: `<span style="background:${color}">${points.map((p) => p.sequence).join("·")}</span>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          })}
          eventHandlers={{ click: () => onSelect(points[0]) }}
        >
          <Popup>
            {points.map((p) => (
              <p key={p.id}>
                <b>
                  {p.sequence}. {p.label}
                </b>
                <br />
                {locationStatusLabels[p.locationStatus]}. Embarque não validado.
              </p>
            ))}
          </Popup>
        </Marker>
      ))}
      {position && (
        <>
          <Circle
            center={[position.lat, position.lon]}
            radius={position.accuracy}
            pathOptions={{ color: "#2170d4", fillOpacity: 0.08, weight: 1 }}
          />
          <Marker
            zIndexOffset={1000}
            title="Você está aqui"
            alt="Sua localização atual"
            position={[position.lat, position.lon]}
            icon={L.divIcon({
              className: "user-marker",
              html: "<span></span>",
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            })}
          >
            <Tooltip
              permanent
              direction="top"
              offset={[0, -18]}
              className="user-location-label"
            >
              Você está aqui
            </Tooltip>
            <Popup>
              Você está aqui. Precisão aproximada:{" "}
              {Math.round(position.accuracy)} m.
            </Popup>
          </Marker>
        </>
      )}
      {showStops &&
        stops.map((s) => (
          <Marker
            key={s.id}
            position={[s.lat, s.lon]}
            icon={L.divIcon({
              className: "station-marker",
              html: "<span>▣</span>",
              iconSize: [24, 24],
            })}
          >
            <Popup>
              <strong>{s.name}</strong>
              <p>
                Local cadastrado no OSM. Sem associação validada com esta linha.
              </p>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
