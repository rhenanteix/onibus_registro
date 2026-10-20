import { getCatalog } from "@/server/transit-repository";
import { MobilityPortal } from "@/components/mobility/MobilityPortal";
export default function Home() {
  return <MobilityPortal initialCatalog={getCatalog()} />;
}
