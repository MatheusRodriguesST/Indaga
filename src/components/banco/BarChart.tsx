"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { GOV_LABEL, type Series } from "@/content/numeros";

const fmt = (v: number, d: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });

const BAR = { lula: "bg-gov-lula", bolsonaro: "bg-gov-bolsonaro" } as const;

/**
 * Colunas a partir do zero (sem eixo truncado), toque/hover mostra o valor,
 * rótulos só no primeiro, no último e nos pontos com nota.
 */
export function BarChart({ series }: { series: Series }) {
  const { points, decimals, unit } = series;
  // folga no topo para o rótulo do valor e o selo "Pandemia" não colidirem
  const max = Math.max(...points.map((p) => p.value)) * 1.25;
  const [active, setActive] = useState<number>(points.length - 1);
  const a = points[active];
  const govs = [...new Set(points.map((p) => p.gov))];

  return (
    <figure className="on-paper">
      {/* leitura do ponto ativo */}
      <div className="flex min-h-[4.5rem] items-end justify-between gap-3 border-b-2 border-ink/15 pb-2" aria-live="polite">
        <div>
          <p className="label text-ink/55">{a.label}</p>
          <p className="display text-5xl leading-none">
            {fmt(a.value, decimals)}
            <span className="ml-1 font-mono text-sm font-semibold normal-case tracking-normal text-ink/60">{unit}</span>
          </p>
        </div>
        <p className="max-w-[11rem] text-right text-xs leading-snug text-ink/70">
          <span className={cn("mr-1.5 inline-block size-2.5 align-middle", BAR[a.gov])} aria-hidden />
          {GOV_LABEL[a.gov]}
          {a.note && <span className="block font-semibold text-ink">{a.note}</span>}
        </p>
      </div>

      {/* plot */}
      <div className="relative mt-3 flex h-56 items-end gap-[2px]" role="group" aria-label={`${series.title}, ${unit}`}>
        {points.map((p, i) => {
          const h = (p.value / max) * 100;
          const pandemic = series.pandemic?.includes(p.label);
          const showLabel = i === 0 || i === points.length - 1 || !!p.note || i === active;
          return (
            <button
              key={p.label}
              type="button"
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              aria-label={`${p.label}: ${fmt(p.value, decimals)} ${unit}, ${GOV_LABEL[p.gov]}`}
              aria-pressed={i === active}
              className={cn(
                "group relative flex h-full flex-1 flex-col items-center justify-end focus-visible:outline-offset-1",
                pandemic && "stripes text-ink/[0.07]",
              )}
            >
              {pandemic && i === points.findIndex((x) => series.pandemic?.includes(x.label)) && (
                <span className="label absolute left-1 top-1 whitespace-nowrap text-[0.6rem] text-ink/60">Pandemia</span>
              )}
              <span className={cn("mb-1 font-mono text-[0.65rem] font-semibold text-ink tabular-nums", !showLabel && "invisible")}>
                {fmt(p.value, decimals)}
              </span>
              <span
                className={cn(
                  "w-full rounded-t-[4px] transition-[filter] duration-150",
                  BAR[p.gov],
                  i === active ? "brightness-90 ring-2 ring-ink ring-offset-1 ring-offset-paper" : "group-hover:brightness-90",
                )}
                style={{ height: `${h}%` }}
              />
            </button>
          );
        })}
      </div>
      {/* eixo x */}
      <div className="flex gap-[2px] border-t-2 border-ink pt-1.5">
        {points.map((p) => (
          <span key={p.label} className="flex-1 text-center font-mono text-[0.62rem] font-semibold text-ink/70">
            {p.label}
          </span>
        ))}
      </div>

      {/* legenda */}
      <figcaption className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {govs.map((g) => (
          <span key={g} className="label flex items-center gap-1.5 text-ink/75">
            <span className={cn("inline-block size-3", BAR[g])} aria-hidden /> {GOV_LABEL[g]}
          </span>
        ))}
        <span className="text-xs text-ink/50">Toque nas barras para ver o valor.</span>
      </figcaption>

      <details className="mt-3 text-sm">
        <summary className="label cursor-pointer text-ink/60 underline decoration-2 underline-offset-4">Ver tabela</summary>
        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-ink">
              <th className="py-1 font-mono text-xs">Período</th>
              <th className="py-1 font-mono text-xs">Governo</th>
              <th className="py-1 text-right font-mono text-xs">{unit}</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.label} className="border-b border-ink/15">
                <td className="py-1">{p.label}</td>
                <td className="py-1">{GOV_LABEL[p.gov]}</td>
                <td className="py-1 text-right tabular-nums">{fmt(p.value, decimals)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
