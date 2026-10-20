import { ImageResponse } from "next/og";
export const alt =
  "Mobilidade Registro — linhas, horários e percursos de ônibus em Registro, SP";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          background: "#eef3e8",
          color: "#18352c",
          padding: 70,
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 5 }}>
          MOBILIDADE REGISTRO · SP
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 88, fontWeight: 700, letterSpacing: -4 }}>
            Seu ônibus. Seu caminho.
          </div>
          <div style={{ fontSize: 34, marginTop: 24 }}>
            Encontre sua linha. Confira a saída. Veja o percurso.
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 23, color: "#52655b" }}>
          Horários publicados · Percursos de referência · Sem GPS da frota
        </div>
      </div>
    ),
    size,
  );
}
