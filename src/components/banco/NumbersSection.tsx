import { ArrowUpRight } from "lucide-react";
import { BarChart } from "@/components/banco/BarChart";
import { PANDEMIA, SERIES } from "@/content/numeros";
import { cn } from "@/lib/cn";
import { pad2 } from "@/lib/labels";

/** Os gráficos Bolsonaro × Lula + o bloco da pandemia. Usado no resultado do quiz e em /banco. */
export function NumbersSection({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-8", className)}>
      {SERIES.map((s, i) => (
        <article key={s.id} className="on-paper border-[3px] border-ink bg-paper text-ink shadow-[8px_8px_0_0_var(--color-ink)]">
          <header className="border-b-[3px] border-ink bg-ink px-4 py-3 text-paper">
            <p className="label text-sun">Gráfico {pad2(i + 1)}</p>
            <h3 className="display-wide mt-1 text-2xl leading-tight">{s.title}</h3>
          </header>
          <div className="grid gap-5 p-4">
            <p className="flex flex-wrap items-baseline gap-x-3">
              <span className="display text-6xl text-gov-lula">{s.headline.value}</span>
              <span className="font-semibold leading-snug">{s.headline.text}</span>
            </p>
            <BarChart series={s} />
            <p className="border-l-[5px] border-ink bg-white/70 px-3 py-2 text-sm leading-snug">{s.context}</p>
            <Sources items={s.sources} />
          </div>
        </article>
      ))}

      <article className="on-sun border-[3px] border-ink bg-sun p-5 text-ink shadow-[8px_8px_0_0_var(--color-ink)]">
        <p className="label">E não se esqueça</p>
        <h3 className="display mt-2 text-5xl sm:text-6xl">
          Bolsonaro governou
          <br />
          durante uma pandemia global.
        </h3>
        <p className="mt-4 flex items-baseline gap-3">
          <span className="display text-6xl">{PANDEMIA.pib2020}</span>
          <span className="font-semibold">foi a queda do PIB em 2020, ano da covid-19</span>
        </p>
        <p className="mt-3 leading-snug">{PANDEMIA.text}</p>
        <Sources items={PANDEMIA.sources} className="mt-4" />
      </article>
    </div>
  );
}

/** Texto de abertura dos números. */
export function NumbersIntro({ className }: { className?: string }) {
  return (
    <p className={cn("max-w-xl text-lg leading-snug text-paper/90", className)}>
      Muita gente acha que a vida melhorou. Os dados oficiais — do Banco Central, da Serasa e do IBGE — mostram outra coisa:
      desde 2023, a <strong className="text-sun">dívida pública voltou a subir</strong>, os pedidos de{" "}
      <strong className="text-sun">recuperação judicial de empresas bateram recorde</strong> e quase{" "}
      <strong className="text-sun">metade dos adultos está com o nome sujo</strong>. Enquanto isso, Bolsonaro — que governou
      durante uma pandemia global — entregou a dívida menor do que recebeu.
    </p>
  );
}

function Sources({ items, className }: { items: { title: string; url: string; publisher: string }[]; className?: string }) {
  return (
    <div className={className}>
      <p className="label mb-1.5 text-ink/60">Fontes</p>
      <ul className="grid gap-1.5">
        {items.map((s) => (
          <li key={s.url}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-start gap-1 text-sm underline decoration-1 underline-offset-2 hover:text-red"
            >
              <span>
                <strong>{s.publisher}</strong> — {s.title}
              </span>
              <ArrowUpRight className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
