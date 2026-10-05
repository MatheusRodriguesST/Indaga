"use client";

import { Download } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { BRAND } from "@/config/brand";
import { Field, Input } from "./fields";

export function QrBuilder({ base }: { base: string }) {
  const [campaign, setCampaign] = useState("");
  const [origin, setOrigin] = useState(base);
  useEffect(() => {
    // o endereço real (ex.: domínio aleatório da Vercel) vale mais que o configurado
    setOrigin(window.location.origin);
  }, []);
  const [svg, setSvg] = useState("");
  const clean = campaign.toLowerCase().replace(/[^a-z0-9-]/g, "");
  const url = `${origin.replace(/\/$/, "")}/desafio${clean ? `/${clean}` : ""}`;

  useEffect(() => {
    QRCode.toString(url, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#111111", light: "#ffffff" } })
      .then(setSvg)
      .catch(() => setSvg(""));
  }, [url]);

  function download() {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `qr-${clean || "desafio"}.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_auto]">
      <div className="grid content-start gap-4">
        <Field label="Campanha (opcional)" hint="Letras minúsculas, números e hífens.">
          <Input value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="sala-3b" className="font-mono" />
        </Field>
        <p className="break-all border-[3px] border-ink bg-white p-3 font-mono text-sm">{url}</p>
        <button
          type="button"
          onClick={download}
          disabled={!svg}
          className="press display-wide inline-flex w-fit items-center gap-2 border-[3px] border-ink bg-sun px-4 py-3 shadow-hard"
        >
          <Download className="size-5" /> Baixar SVG
        </button>
      </div>

      {/* prévia de cartaz para imprimir */}
      <div className="grain relative w-72 overflow-hidden border-[3px] border-ink bg-blood p-5 text-paper shadow-hard">
        <div aria-hidden className="absolute -right-10 top-0 h-full w-16 rotate-[18deg] bg-sun" />
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <LogoMark className="size-7" />
            <span className="display text-2xl">{BRAND.name}</span>
          </div>
          <p className="display mt-4 text-5xl">
            Você conhece
            <br />
            <span className="text-sun">os fatos?</span>
          </p>
          <div className="mt-4 border-[3px] border-ink bg-white p-2" dangerouslySetInnerHTML={{ __html: svg }} />
          <p className="label mt-3 text-sun">Aponte a câmera · 5 perguntas</p>
        </div>
      </div>
    </div>
  );
}
