import { NextResponse } from "next/server";

export async function GET() {
  const spec = {
    openapi: "3.0.3",
    info: {
      title: "Ônibus Registro API",
      description: "API REST pública para consulta de catálogo de linhas e dados em tempo real.",
      version: "0.1.0",
    },
    servers: [{ url: "https://onibus-registro.vercel.app", description: "Produção" }, { url: "/", description: "Local/Atual" }],
    tags: [
      { name: "Catálogo", description: "Listagem do catálogo de linhas" },
      { name: "Linhas", description: "Consulta de linha por ID" },
      { name: "Tempo Real", description: "Status da frota em tempo real" },
    ],
    paths: {
      "/api/catalog": {
        get: {
          tags: ["Catálogo"],
          summary: "Obter catálogo",
          description: "Retorna dados do catálogo com linhas e informações relacionadas.",
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: { type: "object" },
                      meta: {
                        type: "object",
                        properties: {
                          source: { type: "string" },
                          updatedAt: { type: "string" },
                          fleetRealtime: { type: "boolean" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/lines/{id}": {
        get: {
          tags: ["Linhas"],
          summary: "Obter linha por ID",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "ID da linha (ex: 101, 802)",
            },
          ],
          responses: {
            "200": {
              description: "Linha encontrada",
              content: { "application/json": { schema: { type: "object" } } },
            },
            "404": {
              description: "Linha não encontrada",
            },
          },
        },
      },
      "/api/realtime": {
        get: {
          tags: ["Tempo Real"],
          summary: "Status em tempo real",
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      available: { type: "boolean" },
                      vehicles: { type: "array", items: { type: "object" } },
                      reason: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  return NextResponse.json(spec, { headers: { "Access-Control-Allow-Origin": "*" } });
}
