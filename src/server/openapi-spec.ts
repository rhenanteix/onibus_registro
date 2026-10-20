/**
 * Especificação OpenAPI da API de leitura.
 *
 * Os valores aqui descrevem o que a API realmente faz: consulta de catálogo,
 * percursos e horários. Não existe rastreamento da frota nem previsão de
 * chegada, e o endpoint de tempo real informa a indisponibilidade.
 */

export const API_VERSION = "1.0.0";
export const PRODUCTION_URL = "https://onibusregistro-yeal.vercel.app";

export function openApiSpec() {
  return {
    openapi: "3.0.3",
    info: {
      title: "Ônibus Registro API",
      description:
        "API REST pública para consulta do catálogo de linhas, percursos e horários. Não há rastreamento da frota nem previsão de chegada.",
      version: API_VERSION,
    },
    servers: [
      { url: PRODUCTION_URL, description: "Produção" },
      { url: "/", description: "Local/Atual" },
    ],
    tags: [
      { name: "Catálogo", description: "Listagem do catálogo de linhas" },
      { name: "Linhas", description: "Consulta de linha por ID" },
      {
        name: "Tempo Real",
        description:
          "Informa a indisponibilidade de dados da frota. Não simula veículos.",
      },
    ],
    paths: {
      "/api/catalog": {
        get: {
          tags: ["Catálogo"],
          summary: "Obter catálogo",
          description:
            "Retorna dados do catálogo com linhas e informações relacionadas.",
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
              description: "ID da linha (ex: L3, R2)",
            },
          ],
          responses: {
            "200": {
              description: "Linha encontrada",
              content: {
                "application/json": { schema: { type: "object" } },
              },
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
          summary: "Disponibilidade de dados da frota",
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
}
