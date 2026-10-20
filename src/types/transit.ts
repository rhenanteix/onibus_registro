export type DayKey = "week" | "sat" | "sun" | "tuewedfri";
export interface Line {
  id: string;
  name: string;
  kind: string;
  source: string;
  text: string;
  origins: string[];
  issues: string[];
  dayKeys: string[];
  verifiedAt: string;
  operationallyValidated: boolean;
}
export interface Position {
  lat: number;
  lon: number;
  source: string;
  matchedName?: string;
  method: string;
}
export interface ReferencePoint {
  id: string;
  sequence: number;
  label: string;
  boardingValidated: boolean;
  position: Position | null;
}
export interface Journey {
  id: string;
  lineId: string;
  label: string;
  direction: number;
  kind: string;
  source: string;
  sourceText: string;
  boardingValidated: boolean;
  points: ReferencePoint[];
}
export interface Departure {
  time: string;
  note: string;
  variant: string;
  uncertain: boolean;
  sourceStatus: string;
  raw?: string;
}
export type Schedules = Record<string, Partial<Record<DayKey, Departure[][]>>>;
export interface RouteShape {
  status: string;
  method: string;
  variants: {
    direction: number;
    geometry: { coordinates: [number, number][] };
  }[];
}
export interface MappedStop {
  id: string;
  name: string;
  lat: number;
  lon: number;
  source: string;
  lineIds: string[];
  photos: string[];
}
export interface Catalog {
  lines: Line[];
  journeys: Record<string, Journey[]>;
  schedules: Schedules;
  routes: Record<string, RouteShape>;
  stops: MappedStop[];
}
export interface UserPosition {
  lat: number;
  lon: number;
  accuracy: number;
}
