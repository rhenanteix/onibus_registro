import { getCatalog } from "@/server/transit-repository";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export function GET() {
  return Response.json(
    {
      data: getCatalog(),
      meta: {
        source: "versioned-data",
        updatedAt: "2026-10-20",
        fleetRealtime: false,
      },
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    },
  );
}
