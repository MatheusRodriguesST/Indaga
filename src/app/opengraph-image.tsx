import { ImageResponse } from "next/og";
import { BRAND } from "@/config/brand";

export const alt = `${BRAND.name} — Você conhece os fatos?`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#650000",
          position: "relative",
          fontFamily: "sans-serif",
          color: "#f4efe6",
          padding: 64,
        }}
      >
        <div style={{ position: "absolute", right: -80, top: -40, width: 260, height: 800, background: "#a50000", transform: "rotate(18deg)" }} />
        <div style={{ position: "absolute", right: 120, top: -40, width: 46, height: 800, background: "#ffc400", transform: "rotate(18deg)" }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 52, height: 52, background: "#ffc400", border: "4px solid #111" }} />
            <span style={{ fontSize: 44, fontWeight: 900, letterSpacing: -1 }}>{BRAND.name}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 128, fontWeight: 900, lineHeight: 0.9, letterSpacing: -4 }}>
            <span>VOCÊ CONHECE</span>
            <span style={{ color: "#ffc400" }}>OS FATOS?</span>
          </div>
          <span style={{ fontSize: 32, fontWeight: 700 }}>5 perguntas · acontecimentos reais · fontes para conferir</span>
        </div>
      </div>
    ),
    size,
  );
}
