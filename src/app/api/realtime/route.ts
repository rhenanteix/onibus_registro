export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export function GET() {
  return Response.json(
    {
      available: false,
      vehicles: [],
      reason:
        "A operadora ainda não disponibilizou uma integração autorizada com o GPS da frota.",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
