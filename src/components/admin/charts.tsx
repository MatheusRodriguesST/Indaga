import Link from "next/link";
import { cn } from "@/lib/cn";

/* Gráficos do painel: HTML/CSS puro, eixo a partir do zero, valor no title (hover) e tabela implícita nos rótulos. */

export function PeriodTabs({ current, base }: { current: string; base: string }) {
  const opts = [
    ["7", "7 dias"],
    ["30", "30 dias"],
    ["90", "90 dias"],
    ["tudo", "Tudo"],
  ];
  return (
    <nav className="flex flex-wrap gap-1.5" aria-label="Período">
      {opts.map(([v, l]) => (
        <Link
          key={v}
          href={`${base}?p=${v}`}
          aria-current={current === v ? "page" : undefined}
          className={cn("label border-2 border-ink px-3 py-2", current === v ? "bg-ink text-sun" : "bg-white hover:bg-sun-soft")}
        >
          {l}
        </Link>
      ))}
    </nav>
  );
}

export function Funnel({ steps }: { steps: { label: string; value: number; hint: string }[] }) {
  const max = Math.max(1, ...steps.map((s) => s.value));
  return (
    <ol className="grid gap-2.5">
      {steps.map((s, i) => (
        <li key={s.label} className="grid grid-cols-[9.5rem_1fr] items-center gap-3 sm:grid-cols-[12rem_1fr]">
          <span className="text-sm font-bold leading-tight">
            <span className="mr-1.5 font-mono text-xs text-ink/50">{String(i + 1).padStart(2, "0")}</span>
            {s.label}
          </span>
          <span className="relative block h-9 bg-paper-2">
            <span
              className={cn("absolute inset-y-0 left-0 rounded-r-[4px]", i >= 4 ? "bg-gov-lula" : "bg-gov-bolsonaro")}
              style={{ width: `${Math.max(1.5, (100 * s.value) / max)}%` }}
            />
            <span className="absolute inset-y-0 left-2 flex items-center gap-2">
              <span className="display rounded-sm bg-white/90 px-1.5 text-2xl leading-none">{s.value.toLocaleString("pt-BR")}</span>
              <span className="hidden text-xs font-semibold text-ink sm:inline">{s.hint}</span>
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}

export function DailyChart({ data }: { data: { label: string; visitors: number; sessions: number; numbers: number }[] }) {
  const max = Math.max(1, ...data.map((d) => Math.max(d.sessions, d.numbers)));
  const every = data.length > 14 ? 3 : 1;
  return (
    <figure>
      <div className="flex h-44 items-end gap-[2px]">
        {data.map((d) => (
          <div
            key={d.label}
            className="group flex h-full flex-1 items-end justify-center gap-px"
            title={`${d.label}: ${d.visitors} visitantes · ${d.sessions} partidas · ${d.numbers} viram os gráficos`}
          >
            <span className="w-1/2 rounded-t-[3px] bg-gov-bolsonaro group-hover:brightness-90" style={{ height: `${(100 * d.sessions) / max}%` }} />
            <span className="w-1/2 rounded-t-[3px] bg-gov-lula group-hover:brightness-90" style={{ height: `${(100 * d.numbers) / max}%` }} />
          </div>
        ))}
      </div>
      <div className="flex gap-[2px] border-t-2 border-ink pt-1">
        {data.map((d, i) => (
          <span key={d.label} className="flex-1 text-center font-mono text-[0.6rem] text-ink/60">
            {i % every === 0 ? d.label : ""}
          </span>
        ))}
      </div>
      <figcaption className="mt-2 flex flex-wrap gap-4">
        <Legend className="bg-gov-bolsonaro">Partidas</Legend>
        <Legend className="bg-gov-lula">Viram os gráficos</Legend>
        <span className="text-xs text-ink/50">Passe o mouse para ver o dia.</span>
      </figcaption>
    </figure>
  );
}

export function HourlyChart({ data }: { data: number[] }) {
  const max = Math.max(1, ...data);
  const peak = data.indexOf(Math.max(...data));
  return (
    <figure>
      <div className="flex h-28 items-end gap-[2px]">
        {data.map((v, h) => (
          <span
            key={h}
            title={`${h}h: ${v} partidas`}
            className={cn("flex-1 rounded-t-[3px]", h === peak && v > 0 ? "bg-gov-lula" : "bg-gov-bolsonaro")}
            style={{ height: `${Math.max(v ? 4 : 0, (100 * v) / max)}%` }}
          />
        ))}
      </div>
      <div className="flex border-t-2 border-ink pt-1 font-mono text-[0.6rem] text-ink/60">
        {data.map((_, h) => (
          <span key={h} className="flex-1 text-center">
            {h % 3 === 0 ? `${h}h` : ""}
          </span>
        ))}
      </div>
      {Math.max(...data) > 0 && <figcaption className="mt-1 text-xs text-ink/60">Pico: {peak}h (horário de Brasília)</figcaption>}
    </figure>
  );
}

export function HBars({ rows, empty = "Sem dados ainda." }: { rows: { key: string; value: number }[]; empty?: string }) {
  if (!rows.length) return <p className="text-sm text-ink/60">{empty}</p>;
  const max = Math.max(1, ...rows.map((r) => r.value));
  const total = rows.reduce((n, r) => n + r.value, 0);
  return (
    <ul className="grid gap-2">
      {rows.map((r) => (
        <li key={r.key} className="grid grid-cols-[7.5rem_1fr_auto] items-center gap-2 text-sm">
          <span className="truncate font-semibold first-letter:uppercase">{r.key}</span>
          <span className="h-3 bg-paper-2">
            <span className="block h-full rounded-r-[3px] bg-gov-bolsonaro" style={{ width: `${(100 * r.value) / max}%` }} />
          </span>
          <span className="font-mono text-xs tabular-nums">
            {r.value} <span className="text-ink/50">({Math.round((100 * r.value) / total)}%)</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function Legend({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className="label flex items-center gap-1.5 text-ink/75">
      <span className={cn("inline-block size-3", className)} aria-hidden /> {children}
    </span>
  );
}
