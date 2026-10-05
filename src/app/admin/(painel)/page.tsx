import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { DailyChart, Funnel, HBars, HourlyChart, PeriodTabs } from "@/components/admin/charts";
import { PageTitle, Panel, StatCard } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/Button";
import { formatDateTimeBR, getAnalytics, parsePeriod } from "@/server/analytics";
import { repo } from "@/server/repo";

export const dynamic = "force-dynamic";

export default async function Dashboard({ searchParams }: PageProps<"/admin">) {
  const period = parsePeriod((await searchParams).p);
  const r = repo();
  const [a, questions, stats] = await Promise.all([getAnalytics(period), r.listQuestions(), r.stats()]);
  const t = a.totals;

  const ranked = stats.per_question
    .filter((p) => p.answers >= 1)
    .map((p) => ({ ...p, acc: (100 * p.correct) / p.answers, q: questions.find((q) => q.id === p.question_id) }))
    .filter((p) => p.q);
  const mostAnswered = [...ranked].sort((x, y) => y.answers - x.answers).slice(0, 6);
  const avg =
    t.avgSeconds === null
      ? "—"
      : t.avgSeconds < 60
        ? `${Math.round(t.avgSeconds)}s`
        : `${Math.floor(t.avgSeconds / 60)}m${String(Math.round(t.avgSeconds % 60)).padStart(2, "0")}s`;

  return (
    <>
      <PageTitle kicker="Visão geral" title="Painel" actions={<PeriodTabs current={period} base="/admin" />} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Visitantes" value={t.visitors} hint="navegadores únicos" accent />
        <StatCard label="Partidas" value={t.sessions} hint={`${t.completed} terminadas`} />
        <StatCard label="Viram os gráficos" value={t.numbersViews} hint={t.completed ? `${Math.round((100 * t.numbersViews) / t.completed)}% de quem terminou` : undefined} />
        <StatCard label="Com nome" value={t.named} hint={`${t.returning} jogaram mais de uma vez`} />
        <StatCard label="Tempo médio" value={avg} hint="para terminar o quiz" />
        <StatCard label="Cliques em fontes" value={t.sourceClicks} />
        <StatCard label="Compartilharam" value={t.shares} />
        <StatCard label="Perguntas no ar" value={questions.filter((q) => q.editorial_status === "publicada").length} />
      </div>

      <Panel title="Funil — do QR Code aos gráficos" className="mt-8">
        <Funnel steps={a.funnel} />
      </Panel>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title={`Por dia — últimos ${Math.min(a.days, 30)} dias`}>
          <DailyChart data={a.daily} />
        </Panel>
        <Panel title="Horário das partidas">
          <HourlyChart data={a.hourly} />
        </Panel>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Panel title="Dispositivo">
          <HBars rows={a.devices} />
        </Panel>
        <Panel title="De onde vieram">
          <HBars rows={a.referrers} />
        </Panel>
        <Panel title="Campanhas (QR Codes)">
          {a.campaigns.length === 0 ? (
            <p className="text-sm text-ink/60">Sem dados ainda.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-ink text-left font-mono text-[0.65rem] uppercase">
                  <th className="py-1">Campanha</th>
                  <th className="py-1 text-right">Partidas</th>
                  <th className="py-1 text-right">Viram gráf.</th>
                </tr>
              </thead>
              <tbody>
                {a.campaigns.map((c) => (
                  <tr key={c.key} className="border-b border-ink/10">
                    <td className="py-1.5 font-semibold">{c.key}</td>
                    <td className="py-1.5 text-right tabular-nums">{c.sessions}</td>
                    <td className="py-1.5 text-right tabular-nums">
                      {c.numbers} <span className="text-ink/50">({c.sessions ? Math.round((100 * c.numbers) / c.sessions) : 0}%)</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="Fontes mais clicadas">
          {a.topSources.length === 0 ? (
            <p className="text-sm text-ink/60">Ninguém clicou em fontes ainda.</p>
          ) : (
            <ol className="grid gap-2 text-sm">
              {a.topSources.map((s) => (
                <li key={s.url} className="flex items-center gap-3">
                  <span className="display w-10 text-2xl">{s.value}</span>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate underline decoration-1 underline-offset-2 hover:text-red">
                    <strong>{s.host}</strong> {s.url.replace(/^https?:\/\/[^/]+/, "")}
                  </a>
                  <ArrowUpRight className="size-3.5 shrink-0" aria-hidden />
                </li>
              ))}
            </ol>
          )}
        </Panel>
        <Panel title="Perguntas mais respondidas (acerto)">
          {mostAnswered.length === 0 ? (
            <p className="text-sm text-ink/60">Sem respostas ainda.</p>
          ) : (
            <ol className="divide-y-2 divide-ink/10">
              {mostAnswered.map((p) => (
                <li key={p.question_id} className="flex items-center gap-3 py-2">
                  <span className="display w-14 text-2xl">{Math.round(p.acc)}%</span>
                  <Link href={`/admin/perguntas/${p.question_id}`} className="min-w-0 flex-1 truncate font-semibold hover:text-red">
                    {p.q?.title}
                  </Link>
                  <span className="label text-ink/50">{p.answers} resp.</span>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </div>

      <Panel title="Últimas partidas" className="mt-8">
        {a.participants.length === 0 ? (
          <p className="text-sm text-ink/60">Ninguém jogou neste período.</p>
        ) : (
          <ul className="divide-y-2 divide-ink/10">
            {a.participants.slice(0, 8).map((p) => (
              <li key={p.session.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2 text-sm">
                <span className="min-w-[8rem] font-bold">{p.name ?? <span className="font-normal text-ink/50">Anônimo</span>}</span>
                <span className="font-mono text-xs text-ink/60">{formatDateTimeBR(p.session.started_at)}</span>
                <span className="font-mono text-xs">{p.completed ? `${p.session.score}/${p.total}` : "não terminou"}</span>
                {p.sawNumbers && <span className="label bg-gov-lula px-1.5 py-0.5 text-paper">viu gráficos</span>}
                {p.playsByVisitor > 1 && <span className="label bg-sun px-1.5 py-0.5">voltou ({p.playsByVisitor}x)</span>}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4">
          <ButtonLink href={`/admin/participantes?p=${period}`} size="md" variant="paper">
            Ver todos os participantes
          </ButtonLink>
        </div>
      </Panel>
    </>
  );
}
