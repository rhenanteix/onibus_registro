import { NextResponse } from "next/server";
import { GET as getOpenApi } from "@/app/api/openapi/route";

export async function GET() {
  const res = await getOpenApi();
  const json = await res.json();
  return NextResponse.json(json, { headers: { "Access-Control-Allow-Origin": "*" } });
}
