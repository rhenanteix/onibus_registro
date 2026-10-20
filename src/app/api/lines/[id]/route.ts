import { getLine } from "@/server/transit-repository";
export const runtime = "nodejs";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const data = getLine(id.toUpperCase());
  return data
    ? Response.json({ data })
    : Response.json({ error: "Linha não encontrada" }, { status: 404 });
}
