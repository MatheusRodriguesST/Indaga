"use client";

import { ArrowRight, Flag, LoaderCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { activeSession, getRecent, pushRecent, savedName } from "@/lib/client-storage";
import { DIFFICULTY_LABEL } from "@/lib/labels";
import { firstReferrer, rememberReferrer, track } from "@/lib/track";
import type { SessionState } from "@/types/domain";
import { quizApi } from "./api";
import { Dossier } from "./Dossier";
import { Identify } from "./Identify";
import { OptionButton, type OptionState } from "./OptionButton";
import { Progress } from "./Progress";
import { ResultView } from "./ResultView";

type Phase = "boot" | "identify" | "playing" | "result" | "error";

export function QuizApp({ campaign, autoAnonymous }: { campaign: string | null; autoAnonymous: boolean }) {
  const [phase, setPhase] = useState<Phase>("boot");
  const [state, setState] = useState<SessionState | null>(null);
  const [index, setIndex] = useState(0);
  const [pending, setPending] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const revealRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const start = useCallback(
    async (displayName: string | null) => {
      setBusy(true);
      setError(null);
      try {
        savedName.set(displayName);
        const s = await quizApi.start({ displayName, campaign, recent: getRecent(), referrer: firstReferrer() });
        pushRecent(s.questions.map((q) => q.id));
        activeSession.set(s.session_id);
        setState(s);
        setIndex(0);
        setPhase("playing");
        window.scrollTo({ top: 0 });
      } catch (e) {
        setError((e as Error).message);
        setPhase("error");
      } finally {
        setBusy(false);
      }
    },
    [campaign],
  );

  // Retoma partida em andamento (recarregou a página) ou inicia.
  // visita ao /desafio (conta quem abriu, mesmo que não comece)
  useEffect(() => {
    rememberReferrer();
    track("quiz_view", undefined, { campaign });
  }, [campaign]);

  useEffect(() => {
    const n = savedName.get() ?? "";
    setName(n);
    const sid = activeSession.get();
    (async () => {
      if (sid) {
        try {
          const s = await quizApi.state(sid);
          setState(s);
          if (s.completed) {
            setPhase("result");
          } else {
            const firstOpen = s.questions.findIndex((q) => !s.reveals[q.id]);
            setIndex(Math.max(0, firstOpen));
            setPhase("playing");
          }
          return;
        } catch {
          activeSession.set(null);
        }
      }
      if (autoAnonymous) start(null);
      else setPhase("identify");
    })();
  }, [autoAnonymous, start]);

  const q = state?.questions[index];
  const reveal = q ? state?.reveals[q.id] : undefined;
  const isLast = state ? index === state.questions.length - 1 : false;

  const answer = useCallback(
    async (optionId: string) => {
      if (!state || !q || reveal || pending) return; // bloqueia múltiplos cliques
      setPending(optionId);
      try {
        const res = await quizApi.answer(state.session_id, q.id, optionId);
        setState((s) =>
          s ? { ...s, reveals: { ...s.reveals, [q.id]: res.reveal }, completed: res.completed, score: res.score } : s,
        );
        setTimeout(() => revealRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 450);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setPending(null);
      }
    },
    [state, q, reveal, pending],
  );

  const next = useCallback(() => {
    if (!state) return;
    if (isLast) {
      setPhase("result");
    } else {
      setIndex((i) => i + 1);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state, isLast]);

  const restart = useCallback(() => {
    track("restart_click");
    activeSession.set(null);
    start(savedName.get());
  }, [start]);

  // Teclado: A–D / 1–4 respondem, Enter avança.
  useEffect(() => {
    if (phase !== "playing" || !q) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toUpperCase();
      const idx = "ABCD".indexOf(k) >= 0 ? "ABCD".indexOf(k) : "1234".indexOf(k);
      if (!reveal && idx >= 0 && q.options[idx]) {
        e.preventDefault();
        answer(q.options[idx].id);
      } else if (reveal && e.key === "Enter" && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, q, reveal, answer, next]);

  function optionState(optionId: string): OptionState {
    if (pending === optionId) return "pending";
    if (!reveal) return "idle";
    if (optionId === reveal.correct_option_id) return "correct";
    if (optionId === reveal.selected_option_id) return "wrong";
    return "dimmed";
  }

  return (
    <div ref={topRef} className="grain min-h-dvh bg-blood">
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -right-32 -top-10 h-[140%] w-40 rotate-[18deg] bg-red/60" />
        <div className="halftone absolute -bottom-24 -left-24 size-72 rounded-full text-red/50" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-3xl flex-col px-5 pb-16 pt-5 sm:px-8">
        <header className="mb-8 flex items-center justify-between">
          <Logo />
          {phase === "playing" && state?.display_name && <span className="label truncate text-paper/70">{state.display_name}</span>}
        </header>

        <AnimatePresence mode="wait">
          {phase === "boot" && (
            <motion.div key="boot" className="flex flex-1 items-center justify-center" exit={{ opacity: 0 }}>
              <LoaderCircle className="size-10 animate-spin text-sun" aria-label="Carregando" />
            </motion.div>
          )}

          {phase === "identify" && (
            <motion.div key="identify" className="flex flex-1 items-center" exit={{ opacity: 0, y: -20 }}>
              <Identify initialName={name} busy={busy} onStart={start} />
            </motion.div>
          )}

          {phase === "error" && (
            <motion.div key="error" className="flex flex-1 flex-col items-start justify-center gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="label text-sun">Algo travou</p>
              <p className="display text-6xl">Não deu para sortear as perguntas.</p>
              <p className="text-paper/80">{error}</p>
              <Button onClick={() => setPhase("identify")}>Tentar de novo</Button>
            </motion.div>
          )}

          {phase === "playing" && state && q && (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Progress
                current={index}
                total={state.questions.length}
                results={state.questions.map((x) => (state.reveals[x.id] ? state.reveals[x.id].is_correct : null))}
              />

              <AnimatePresence mode="wait">
                <motion.section
                  key={q.id}
                  initial={{ x: 60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -60, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.2, 0.9, 0.1, 1] }}
                  className="mt-8"
                  aria-labelledby={`q-${q.id}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {q.category && (
                      <Badge tone="sun">
                        <span aria-hidden>{q.category.emoji}</span> {q.category.name}
                      </Badge>
                    )}
                    <Badge tone="outline" className="text-paper/70">
                      {DIFFICULTY_LABEL[q.difficulty]}
                    </Badge>
                    {q.is_demo && <Badge tone="red">Demo / exemplo</Badge>}
                  </div>

                  <h1 id={`q-${q.id}`} className="headline mt-5 text-[clamp(1.75rem,7.2vw,2.9rem)]">
                    {q.question_text}
                  </h1>

                  <div className="mt-8 grid gap-4" role="group" aria-label="Alternativas">
                    {q.options.map((o, i) => (
                      <OptionButton
                        key={o.id}
                        index={i}
                        option={o}
                        state={optionState(o.id)}
                        disabled={!!reveal || !!pending}
                        onSelect={() => answer(o.id)}
                      />
                    ))}
                  </div>

                  {error && !reveal && (
                    <p role="alert" className="mt-4 border-2 border-sun bg-ink px-3 py-2 text-sun">
                      {error}
                    </p>
                  )}

                  <AnimatePresence>
                    {reveal && (
                      <motion.div
                        ref={revealRef}
                        initial={{ y: 80, opacity: 0, rotate: 1.5 }}
                        animate={{ y: 0, opacity: 1, rotate: 0 }}
                        transition={{ duration: 0.5, ease: [0.2, 0.9, 0.1, 1], delay: 0.15 }}
                        className="mt-10 scroll-mt-4 shadow-[10px_10px_0_0_var(--color-ink)]"
                      >
                        <Dossier reveal={reveal} index={index} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {reveal && (
                    <div className="sticky bottom-0 z-20 -mx-5 mt-8 bg-gradient-to-t from-blood via-blood/95 to-transparent px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6 sm:-mx-8 sm:px-8">
                      <Button
                        size="xl"
                        block
                        onClick={next}
                        icon={isLast ? <Flag className="size-6" strokeWidth={3} /> : <ArrowRight className="size-7" strokeWidth={3} />}
                      >
                        {isLast ? "Ver resultado" : "Próxima pergunta"}
                      </Button>
                    </div>
                  )}
                </motion.section>
              </AnimatePresence>
            </motion.div>
          )}

          {phase === "result" && state && (
            <motion.div key="result" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <ResultView state={state} onRestart={restart} restarting={busy} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
