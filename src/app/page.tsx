import { ArrowRight, FileSearch, ShieldCheck, UserRoundX } from "lucide-react";
import { Track } from "@/components/analytics/Track";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { Marquee } from "@/components/ui/Marquee";
import { Rise } from "@/components/ui/Rise";
import { BRAND, QUIZ_CONFIG } from "@/config/brand";
import { pad2 } from "@/lib/labels";

const STEPS = [
  ["Você recebe", `${QUIZ_CONFIG.quizSize} perguntas aleatórias.`],
  ["Você", "responde."],
  ["Você", "descobre a resposta."],
  ["Você", "consulta as fontes."],
  ["Você tira", "suas próprias conclusões."],
] as const;

export default function Home() {
  return (
    <main className="overflow-x-clip">
      <Track type="landing_view" />
      {/* ================= HERO / CARTAZ ================= */}
      <section className="grain relative min-h-[100svh] bg-blood px-6 pb-16 pt-6">
        {/* geometria de cartaz */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -right-24 top-24 h-[130%] w-56 rotate-[18deg] bg-red" />
          <div className="absolute -right-10 top-0 h-full w-10 rotate-[18deg] bg-sun" />
          <div
            className="absolute bottom-0 left-0 h-64 w-full bg-blood-deep"
            style={{ clipPath: "polygon(0 45%, 100% 0, 100% 100%, 0 100%)" }}
          />
          <div className="halftone absolute -left-10 top-1/3 size-56 rounded-full text-red/70" />
          <span className="display outline-text absolute -bottom-6 -right-4 select-none text-[16rem] text-sun/25 sm:text-[22rem]">
            {pad2(QUIZ_CONFIG.quizSize)}
          </span>
        </div>

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col">
          <header className="flex items-center justify-between">
            <Logo />
            <span className="label hidden text-sun sm:block">Edição Nº 001 · Educação cívica</span>
          </header>

          <div className="mt-14 sm:mt-20">
            <Rise>
              <p className="label mb-5 inline-flex items-center gap-2 bg-ink px-2 py-1 text-sun">
                <span className="inline-block size-2 animate-blink rounded-full bg-flame" /> Desafio aberto
              </p>
            </Rise>
            <h1 className="display text-[clamp(5.2rem,24vw,13rem)]">
              <Rise delay={0.05}>
                <span className="block">Você</span>
              </Rise>
              <Rise delay={0.12}>
                <span className="block">conhece</span>
              </Rise>
              <Rise delay={0.19}>
                <span className="block">
                  os <span className="text-sun">fatos?</span>
                </span>
              </Rise>
            </h1>
          </div>

          <Rise delay={0.3} className="mt-8 max-w-md">
            <p className="display-wide text-2xl leading-[1.05] sm:text-3xl">
              {QUIZ_CONFIG.quizSize} perguntas.
              <br />
              <span className="text-sun">Acontecimentos reais.</span>
              <br />
              Fontes para você conferir.
            </p>
          </Rise>

          <Rise delay={0.4} className="mt-10 flex flex-col gap-4 sm:flex-row">
            <ButtonLink href="/desafio" size="xl" icon={<ArrowRight className="size-7" strokeWidth={3} />}>
              Começar desafio
            </ButtonLink>
          </Rise>
          <p className="label mt-5 text-paper/70">Sem cadastro · ~3 minutos · funciona no celular</p>
        </div>
      </section>

      <Marquee
        className="z-20 -mt-6"
        items={["Pergunte", "Verifique", "Questione", "Confira a fonte", "Você teria acertado?"]}
      />

      {/* ================= COMO FUNCIONA ================= */}
      <section className="on-paper grain relative bg-paper px-6 pb-20 pt-20 text-ink">
        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="flex items-end justify-between gap-6 border-b-[3px] border-ink pb-4">
            <h2 className="display text-6xl sm:text-8xl">Como funciona?</h2>
            <span className="label hidden sm:block">Leia antes · 01–05</span>
          </div>

          <ol className="mt-2">
            {STEPS.map(([a, b], i) => (
              <li
                key={i}
                className="group grid grid-cols-[auto_1fr] items-center gap-5 border-b-2 border-ink/80 py-5 sm:gap-10"
              >
                <span className="display text-7xl text-red transition-colors group-hover:text-ink sm:text-9xl">
                  {pad2(i + 1)}
                </span>
                <p className="display-wide text-2xl sm:text-4xl">
                  <span className="text-ink/45">{a} </span>
                  {b}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-14 grid gap-4 sm:grid-cols-3">
            {[
              { icon: UserRoundX, t: "Sem cadastro", d: "Não pedimos e-mail, CPF, telefone nem senha. Nome é opcional." },
              { icon: FileSearch, t: "Fonte em tudo", d: "Cada resposta vem com o documento original para você abrir." },
              { icon: ShieldCheck, t: "Sem rótulo", d: "O resultado mostra só acertos. Ninguém é classificado politicamente." },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="border-[3px] border-ink bg-white p-5 shadow-hard">
                <Icon className="size-8 text-red" strokeWidth={2.5} aria-hidden />
                <h3 className="display-wide mt-4 text-2xl">{t}</h3>
                <p className="mt-2 text-[0.95rem] leading-snug text-ink/80">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA FINAL ================= */}
      <section className="grain relative overflow-hidden bg-ink px-6 py-20">
        <div aria-hidden className="stripes absolute inset-y-0 -left-10 w-40 text-red/40" />
        <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="label text-sun">Não é necessário cadastro.</p>
            <h2 className="display mt-3 text-7xl sm:text-9xl">
              Você teria
              <br />
              <span className="text-sun">acertado?</span>
            </h2>
          </div>
          <div className="flex flex-col gap-4 sm:w-80">
            <ButtonLink href="/desafio?anonimo=1" variant="sun" size="lg" block className="shadow-[6px_6px_0_0_var(--color-red)]" icon={<ArrowRight className="size-6" strokeWidth={3} />}>
              Continuar anonimamente
            </ButtonLink>
            <ButtonLink href="/desafio" variant="paper" size="lg" block className="shadow-[6px_6px_0_0_var(--color-red)]">
              Identificar-me
            </ButtonLink>
          </div>
        </div>
      </section>

      <footer className="bg-blood-deep px-6 py-10 text-paper/70">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="display-wide text-xl text-paper">{BRAND.tagline}</p>
          <p className="label max-w-md leading-relaxed text-paper/60">
            Projeto independente de educação cívica. Sem vínculo com partidos ou campanhas. Conteúdo com fontes
            públicas — confira e discorde à vontade.
          </p>
        </div>
      </footer>
    </main>
  );
}
