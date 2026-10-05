"use client";

import { Check, ChevronDown, ListChecks, RotateCcw, Share2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { BRAND } from "@/config/brand";
import { cn } from "@/lib/cn";
import { pad2 } from "@/lib/labels";
import type { SessionState } from "@/types/domain";
import { Dossier } from "./Dossier";
import { NumbersIntro, NumbersSection } from "@/components/banco/NumbersSection";

export function ResultView({
  state,
  onRestart,
  restarting,
}: {
  state: SessionState;
  onRestart: () => void;
  restarting: boolean;
}) {
  const total = state.questions.length;
  const score = state.score ?? Object.values(state.reveals).filter((r) => r.is_correct).length;
  const [open, setOpen] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  async function share() {
    const url = window.location.origin;
    const text = `Fiz ${score}/${total} no desafio ${BRAND.name}. E você?`;
    try {
      if (navigator.share) {
        await navigator.share({ title: BRAND.name, text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      setToast("Link copiado!");
    } catch {
      setToast(null);
    }
    setTimeout(() => setToast(null), 2200);
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* placar */}
      <section className="relative">
        <p className="label text-sun">Desafio concluído{state.display_name ? ` · ${state.display_name}` : ""}</p>
        <motion.p
          className="display mt-2 flex items-baseline text-[clamp(9rem,45vw,17rem)] leading-[0.8]"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          aria-label={`${score} de ${total}`}
        >
          <span className="text-sun">{score}</span>
          <span className="outline-text text-paper/80">/{total}</span>
        </motion.p>
        <p className="display-wide mt-4 text-3xl sm:text-4xl">
          Você acertou {score} de {total} {total === 1 ? "questão" : "questões"}.
        </p>
        <p className="mt-2 text-paper/70">Consulte as fontes para conhecer o contexto completo.</p>
      </section>

      {/* os números — logo abaixo do placar */}
      <section className="mt-14" aria-labelledby="numeros-title">
        <p className="label flex items-center gap-2 text-sun">
          <span className="inline-block size-2 animate-blink rounded-full bg-flame" /> Antes de sair
        </p>
        <h2 id="numeros-title" className="display mt-2 text-[clamp(3.25rem,16vw,7rem)]">
          O que a propaganda
          <br />
          <span className="text-sun">não mostra.</span>
        </h2>
        <NumbersIntro className="mt-5" />
        <NumbersSection className="mt-8" />
      </section>

      {/* cartão-resposta */}
      <section className="on-paper mt-14 border-[3px] border-ink bg-paper text-ink shadow-hard-sun">
        <h2 className="label flex items-center justify-between border-b-[3px] border-ink px-4 py-3">
          <span>Questões</span>
          <span className="hidden text-ink/60 sm:inline">Toque para ver explicação e fontes</span>
        </h2>
        <ol>
          {state.questions.map((q, i) => {
            const r = state.reveals[q.id];
            const isOpen = open === q.id;
            return (
              <li key={q.id} className="border-b-2 border-ink/80 last:border-b-0">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : q.id)}
                  aria-expanded={isOpen}
                  className="grid w-full grid-cols-[auto_auto_1fr_auto] items-center gap-3 px-4 py-4 text-left hover:bg-sun-soft sm:gap-5"
                >
                  <span className="display text-4xl">{pad2(i + 1)}</span>
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center border-[3px] border-ink",
                      r?.is_correct ? "bg-sun" : "bg-red text-paper",
                    )}
                    aria-hidden
                  >
                    {r?.is_correct ? <Check className="size-5" strokeWidth={4} /> : <X className="size-5" strokeWidth={4} />}
                  </span>
                  <span className="min-w-0">
                    <span className="label block text-ink/60">{r?.is_correct ? "Acertou" : "Errou"}</span>
                    <span className="block truncate font-bold">{r?.title ?? q.question_text}</span>
                  </span>
                  <ChevronDown className={cn("size-6 transition-transform", isOpen && "rotate-180")} aria-hidden />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && r && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.2, 0.9, 0.1, 1] }}
                      className="overflow-hidden border-t-2 border-ink bg-paper-2"
                    >
                      <p className="px-5 pt-4 font-semibold leading-snug sm:px-8">{q.question_text}</p>
                      <Dossier reveal={r} index={i} showStamp={false} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mt-12 text-center">
        <p className="display text-5xl sm:text-6xl">
          Conhecimento não termina
          <br />
          <span className="text-sun">na resposta.</span>
        </p>
        <div className="mx-auto mt-8 grid max-w-md gap-4">
          <ButtonLink href="/banco#respostas" size="xl" block icon={<ListChecks className="size-6" strokeWidth={3} />}>
            Ver todas as respostas
          </ButtonLink>
          <Button size="lg" variant="ink" block onClick={onRestart} disabled={restarting} icon={<RotateCcw className="size-5" strokeWidth={2.5} />}>
            {restarting ? "Sorteando…" : "Fazer novo desafio"}
          </Button>
          <Button size="lg" variant="paper" block onClick={share} icon={<Share2 className="size-5" strokeWidth={2.5} />}>
            Compartilhar resultado
          </Button>
        </div>
        <p aria-live="polite" className="label mt-4 h-5 text-sun">
          {toast}
        </p>
      </section>
    </div>
  );
}
