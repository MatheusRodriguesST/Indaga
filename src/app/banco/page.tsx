import { ArrowLeft, ArrowUpRight, ChevronDown } from "lucide-react";
import type { Metadata } from "next";
import { Track } from "@/components/analytics/Track";
import { Logo } from "@/components/brand/Logo";
import { NumbersIntro, NumbersSection } from "@/components/banco/NumbersSection";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { QUIZ_CONFIG } from "@/config/brand";
import { SOURCE_LABEL, formatDateBR, pad2 } from "@/lib/labels";
import { repo } from "@/server/repo";

export const metadata: Metadata = {
  title: "Banco de respostas",
  description: "Todas as perguntas, respostas e fontes — e os números que a propaganda não mostra.",
};

export const dynamic = "force-dynamic";

export default async function BancoPage() {
  const r = repo();
  const pool = await r.listPool(QUIZ_CONFIG.collection || undefined);
  const questions = await r.getQuestionsFull(pool.map((p) => p.id));

  return (
    <main className="overflow-x-clip bg-blood">
      <Track type="banco_view" />
      {/* ================= ABERTURA ================= */}
      <header className="grain relative px-5 pb-12 pt-5">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 top-10 h-[140%] w-40 rotate-[18deg] bg-red/70" />
          <div className="absolute -right-6 top-0 h-full w-6 rotate-[18deg] bg-sun" />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl">
          <Logo />
          <p className="label mt-12 text-sun">Banco de respostas</p>
          <h1 className="display mt-3 text-[clamp(3.25rem,16vw,9rem)]">
            O que a
            <br />
            propaganda
            <br />
            <span className="text-sun">não mostra.</span>
          </h1>
          <NumbersIntro className="mt-6" />
          <nav className="mt-8 flex flex-wrap gap-2" aria-label="Seções">
            <a href="#numeros" className="label border-2 border-sun px-3 py-2 text-sun hover:bg-sun hover:text-ink">
              Os números
            </a>
            <a href="#respostas" className="label border-2 border-paper/60 px-3 py-2 hover:bg-paper hover:text-ink">
              Todas as respostas ({questions.length})
            </a>
          </nav>
        </div>
      </header>

      {/* ================= NÚMEROS ================= */}
      <section id="numeros" className="scroll-mt-4 px-5 pb-16">
        <NumbersSection className="mx-auto max-w-3xl" />
      </section>

      {/* ================= RESPOSTAS ================= */}
      <section id="respostas" className="on-paper grain scroll-mt-4 bg-paper px-5 pb-20 pt-14 text-ink">
        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="border-b-[3px] border-ink pb-4">
            <p className="label text-red">Gabarito completo</p>
            <h2 className="display mt-1 text-6xl sm:text-7xl">Todas as respostas</h2>
            <p className="mt-2 text-ink/70">Toque em uma pergunta para ver a resposta, o contexto e as fontes.</p>
          </div>

          <ol className="mt-4 grid gap-3">
            {questions.map((q, i) => {
              const correct = q.options.find((o) => o.is_correct);
              const answer = correct?.option_text ?? q.reveal_answer ?? "—";
              return (
                <li key={q.id}>
                  <details className="group border-[3px] border-ink bg-white open:shadow-hard-sm">
                    <summary className="grid cursor-pointer list-none grid-cols-[auto_1fr_auto] items-start gap-3 p-4 [&::-webkit-details-marker]:hidden">
                      <span className="display text-3xl text-red">{pad2(i + 1)}</span>
                      <span className="font-semibold leading-snug">{q.question_text}</span>
                      <ChevronDown className="mt-1 size-5 transition-transform group-open:rotate-180" aria-hidden />
                    </summary>
                    <div className="border-t-2 border-ink px-4 pb-5 pt-4">
                      <p className="label text-ink/60">{correct ? "Resposta" : "Nenhuma das alternativas. Na verdade, foi:"}</p>
                      <p className="display-wide mt-1 bg-sun px-3 py-2 text-xl leading-tight">{answer}</p>
                      <p className="mt-3 font-semibold leading-snug">{q.short_explanation}</p>
                      <p className="mt-2 text-[0.95rem] leading-relaxed text-ink/80">{q.long_explanation}</p>
                      {q.legal_status && <p className="mt-3 text-sm text-ink/60">⚖️ {q.legal_status}</p>}
                      <ul className="mt-4 grid gap-2">
                        {q.sources.map((s) => (
                          <li key={s.id}>
                            <a
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group/src flex items-start justify-between gap-3 border-2 border-ink/80 px-3 py-2 hover:bg-sun-soft"
                            >
                              <span>
                                <Badge tone={s.source_type === "primaria" ? "ink" : "paper"} className="mb-1">
                                  {SOURCE_LABEL[s.source_type]}
                                </Badge>
                                <span className="block text-sm font-semibold leading-snug">{s.title}</span>
                                <span className="block text-xs text-ink/60">
                                  {s.publisher}
                                  {s.publication_date && ` · ${formatDateBR(s.publication_date)}`}
                                </span>
                              </span>
                              <ArrowUpRight className="mt-1 size-4 shrink-0" aria-hidden />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </details>
                </li>
              );
            })}
          </ol>

          <div className="mt-12 grid gap-3 sm:max-w-sm">
            <ButtonLink href="/desafio" size="lg" block>
              Fazer o desafio
            </ButtonLink>
            <ButtonLink href="/" variant="paper" size="md" block icon={<ArrowLeft className="size-5" />}>
              Voltar ao início
            </ButtonLink>
          </div>
          <p className="mt-8 text-sm text-ink/60">
            Todos os números têm link para a fonte original. Encontrou um erro? Confira o documento e nos avise.
          </p>
        </div>
      </section>
    </main>
  );
}

