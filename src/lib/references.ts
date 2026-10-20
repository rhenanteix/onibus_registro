import type {
  Journey,
  LocationStatus,
  ReferencePoint,
} from "../types/transit.ts";

/**
 * Situação da coordenada de uma referência do percurso.
 * - confirmada: ponto de embarque validado pela operadora, com coordenada
 * - aproximada: existe coordenada, mas obtida por aproximação de rua ou bairro
 * - sem_localizacao: a referência existe no itinerário e não tem coordenada
 */
export const locationStatusLabels: Record<LocationStatus, string> = {
  confirmada: "Localização confirmada",
  aproximada: "Localização aproximada",
  sem_localizacao: "Sem localização cadastrada",
};

export const locationStatusShortLabels: Record<LocationStatus, string> = {
  confirmada: "Confirmada",
  aproximada: "Aproximada",
  sem_localizacao: "Sem localização",
};

/** Situação esperada a partir dos dados brutos, sem confiar no campo gravado. */
export function locationStatusFor(
  point: Pick<ReferencePoint, "position" | "boardingValidated">,
): LocationStatus {
  if (!point.position) return "sem_localizacao";
  if (point.boardingValidated && point.position.method === "confirmed") {
    return "confirmada";
  }
  return "aproximada";
}

/** Uma referência sem coordenada continua no itinerário; nada é inventado. */
export function hasCoordinates(
  point: Pick<ReferencePoint, "position">,
): boolean {
  return point.position !== null;
}

export interface ReferenceRecord {
  lineId: string;
  journeyId: string;
  point: ReferencePoint;
}

/** Todas as referências do catálogo, na ordem das linhas e dos percursos. */
export function collectReferences(
  journeys: Record<string, Journey[]>,
): ReferenceRecord[] {
  return Object.entries(journeys).flatMap(([lineId, list]) =>
    list.flatMap((journey) =>
      journey.points.map((point) => ({ lineId, journeyId: journey.id, point })),
    ),
  );
}

export interface LineCount {
  lineId: string;
  total: number;
  confirmada: number;
  aproximada: number;
  sem_localizacao: number;
}

/** Contagem por linha e por situação de localização. */
export function countByLine(records: ReferenceRecord[]): LineCount[] {
  const acc = records.reduce<Record<string, LineCount>>(
    (acc, { lineId, point }) => {
      const row =
        acc[lineId] ??
        (acc[lineId] = {
          lineId,
          total: 0,
          confirmada: 0,
          aproximada: 0,
          sem_localizacao: 0,
        });
      row.total += 1;
      row[locationStatusFor(point)] += 1;
      return acc;
    },
    {},
  );
  return Object.values(acc).sort((a, b) => a.lineId.localeCompare(b.lineId));
}
