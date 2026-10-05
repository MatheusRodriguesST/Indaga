"use client";

import { ArrowUpRight, CalendarCheck, Landmark, Scale } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Stamp } from "@/components/ui/Stamp";
import { cn } from "@/lib/cn";
import { CLAIM_LABEL, CLAIM_TONE, SOURCE_CTA, SOURCE_LABEL, formatDateBR, pad2 } from "@/lib/labels";
import type { Reveal } from "@/types/domain";

/**
 * "Dossiê" da resposta: o momento em que o cartaz vira documento.
 * Ordem do briefing: o que aconteceu → por que → situação jurídica → fontes.
 */
export function Dossier({
  reveal,
  index,
  compact = false,
  showStamp = true,
}: {
  reveal: Reveal;
  index: number;
  compact?: boolean;
  showStamp?: boolean;
}) {
  return (
    <article className="on-paper relative bg-paper text-ink">
      <div className="perforated h-3 bg-paper" aria-hidden />
      <div className="grain">
        <div className="relative z-10 px-5 pb-8 pt-3 sm:px-8">
          <header className="flex items-start justify-between gap-4 border-b-2 border-dashed border-ink/50 pb-3">
            <div>
              <p className="label text-ink/60">Dossiê · Q-{pad2(index + 1)}</p>
              <h3 className="display-wide mt-1 text-xl leading-tight sm:text-2xl">{reveal.title}</h3>
            </div>
            {reveal.period && <Badge tone="paper">{reveal.period}</Badge>}
          </header>

          {showStamp && (
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3" aria-hidden>
              {reveal.is_trick ? (
                <Stamp tone="red" rotate={-6}>
                  Errou.
                </Stamp>
              ) : reveal.is_correct ? (
                <Stamp tone="ink" rotate={-6}>
                  Acertou.
                </Stamp>
              ) : (
                <Stamp tone="red" rotate={-5} className="text-[1.6rem] sm:text-[2rem]">
                  A resposta era:
                </Stamp>
              )}
            </div>
          )}

          {reveal.is_trick && (
            <p className="label mt-5 text-ink/70" aria-hidden>
              Nenhuma das alternativas. Na verdade, foi:
            </p>
          )}
          <p className={cn("display-wide bg-sun px-3 py-2 text-2xl leading-tight sm:text-3xl", reveal.is_trick ? "mt-2" : "mt-4")} role="status">
            <span className="sr-only">
              {reveal.is_trick
                ? "Você errou: não foi nenhuma das alternativas. Na verdade, foi: "
                : reveal.is_correct
                  ? "Você acertou. "
                  : "Você errou. A resposta correta era: "}
            </span>
            {reveal.correct_text}
          </p>

          <Section label="O que aconteceu?">
            <p className="text-lg font-semibold leading-snug">{reveal.short_explanation}</p>
          </Section>

          {!compact && reveal.long_explanation && (
            <Section label="Por que essa é a resposta?">
              <p className="leading-relaxed text-ink/85">{reveal.long_explanation}</p>
            </Section>
          )}

          {reveal.claims.length > 0 && (
            <Section label="Natureza da informação">
              <ul className="space-y-3">
                {reveal.claims.map((c, i) => (
                  <li key={i} className="grid gap-1.5">
                    <Badge tone={CLAIM_TONE[c.kind]} className="w-fit">
                      {CLAIM_LABEL[c.kind]}
                    </Badge>
                    <p className="leading-snug text-ink/85">{c.text}</p>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {(reveal.legal_status || reveal.legislation.length > 0) && (
            <Section label="Relação jurídica" icon={<Scale className="size-4" aria-hidden />}>
              {reveal.legal_status && (
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {reveal.legal_status_kind && <Badge tone={CLAIM_TONE[reveal.legal_status_kind]}>{CLAIM_LABEL[reveal.legal_status_kind]}</Badge>}
                  <span className="text-[0.95rem] text-ink/80">{reveal.legal_status}</span>
                </div>
              )}
              <ul className="space-y-2">
                {reveal.legislation.map((l) => (
                  <li key={l.id} className="border-l-[5px] border-red bg-white/70 px-3 py-2">
                    <p className="font-bold leading-tight">
                      {l.title}
                      {l.article && <span className="font-mono text-sm font-semibold text-red"> · {l.article}</span>}
                    </p>
                    {l.description && <p className="mt-1 text-sm italic text-ink/75">“{l.description}”</p>}
                    {l.relevance && <p className="mt-1 text-sm text-ink/80">{l.relevance}</p>}
                    {l.url && (
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className="label mt-1.5 inline-flex items-center gap-1 underline decoration-2 underline-offset-4 hover:text-red">
                        Texto oficial <ArrowUpRight className="size-3.5" aria-hidden />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section label="Confira as fontes" icon={<Landmark className="size-4" aria-hidden />}>
            {reveal.sources.length === 0 ? (
              <p className="text-ink/70">Fonte em verificação.</p>
            ) : (
              <ul className="grid gap-3">
                {reveal.sources.map((s) => (
                  <li key={s.id}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "press group grid gap-2 border-[3px] border-ink bg-white p-4 shadow-hard-sm hover:bg-sun-soft",
                        s.source_type === "primaria" && "border-l-[10px]",
                      )}
                    >
                      <span className="flex items-center justify-between gap-3">
                        <Badge tone={s.source_type === "primaria" ? "ink" : "paper"}>{SOURCE_LABEL[s.source_type]}</Badge>
                        <span className="label text-ink/60">{formatDateBR(s.publication_date)}</span>
                      </span>
                      <span className="font-bold leading-tight">{s.title}</span>
                      {s.publisher && <span className="text-sm text-ink/70">{s.publisher}</span>}
                      <span className="label inline-flex items-center gap-1 text-red">
                        {SOURCE_CTA[s.source_type]}
                        <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <p className="label mt-6 flex items-center gap-2 text-ink/55">
            <CalendarCheck className="size-4" aria-hidden />
            Última verificação das fontes: {formatDateBR(reveal.last_verified_at)}
          </p>
          <p className="mt-2 text-sm text-ink/60">Não fique apenas com a resposta. Abra os documentos e tire suas conclusões.</p>
        </div>
      </div>
    </article>
  );
}

function Section({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <h4 className="label mb-2.5 flex items-center gap-2 text-red">
        {icon}
        {label}
      </h4>
      {children}
    </section>
  );
}
