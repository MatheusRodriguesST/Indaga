"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { pad2 } from "@/lib/labels";

/** Barra segmentada: uma "casa" por pergunta, como num cartão-resposta. */
export function Progress({
  current,
  total,
  results,
}: {
  current: number;
  total: number;
  results: (boolean | null)[];
}) {
  const answered = results.filter((r) => r !== null).length;
  const pct = Math.round((answered / total) * 100);
  return (
    <div>
      <div className="flex items-end justify-between">
        <p className="label text-sun">Desafio</p>
        <p className="display text-5xl leading-none" aria-label={`Pergunta ${current + 1} de ${total}`}>
          {pad2(current + 1)}
          <span className="text-paper/40"> / {pad2(total)}</span>
        </p>
      </div>
      <div
        className="mt-3 grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={`${pct}% concluído`}
      >
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className={cn("relative h-3 overflow-hidden border-2 border-ink bg-blood-deep", i === current && "ring-2 ring-sun ring-offset-2 ring-offset-blood")}>
            <motion.div
              className={cn("absolute inset-0", results[i] === false ? "stripes bg-red text-ink/40" : "bg-sun")}
              initial={false}
              animate={{ scaleX: results[i] === null ? 0 : 1 }}
              style={{ originX: 0 }}
              transition={{ duration: 0.45, ease: [0.2, 0.9, 0.1, 1] }}
            />
          </div>
        ))}
      </div>
      <p className="label mt-2 text-right text-paper/60">{pct}%</p>
    </div>
  );
}
