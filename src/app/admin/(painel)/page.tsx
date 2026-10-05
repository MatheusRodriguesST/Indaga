import Link from "next/link";
import { PageTitle, Panel, StatCard } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/Button";
import { repo } from "@/server/repo";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const r = repo();
  const [questions, stats] = await Promise.all([r.listQuestions(), r.stats()]);
  const count = (s: string) => questions.filter((q) => q.editorial_status === s).length;

  const ranked = stats.per_question
    .filter((p) => p.answers >= 1)
    .map((p) => ({ ...p, acc: (100 * p.correct) / p.answers, q: questions.find((q) => q.id === p.question_id) }))
    .filter((p) => p.q);
  const hardest = [...ranked].sort((a, b) => a.acc - b.acc).slice(0, 5);
  const easiest = [...ranked].sort((a, b) => b.acc - a.acc).slice(0, 5);
  const abandon = stats.sessions ? Math.round((100 * (stats.sessions - stats.completed)) / stats.sessions) : null;

  return (
    <>
      <PageTitle kicker="Visão geral" title="Painel" actions={<ButtonLink href="/admin/perguntas/nova" size="md">Nova pergunta</ButtonLink>} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Perguntas" value={questions.length} accent />
        <StatCard label="Publicadas" value={count("publicada")} />
        <StatCard label="Em revisão" value={count("em_revisao")} />
        <StatCard label="Rascunhos" value={count("rascunho")} />
        <StatCard label="Sessões" value={stats.sessions} />
        <StatCard label="Concluídas" value={stats.completed} hint={abandon !== null ? `${abandon}% de abandono` : undefined} />
        <StatCard label="Acerto médio" value={stats.avg_accuracy !== null ? `${Math.round(stats.avg_accuracy)}%` : "—"} />
        <StatCard label="Nota média" value={stats.avg_score !== null ? stats.avg_score.toFixed(1) : "—"} />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <RankPanel title="Perguntas mais difíceis" rows={hardest} />
        <RankPanel title="Perguntas mais fáceis" rows={easiest} />
      </div>
      <p className="mt-6 text-sm text-ink/60">
        Estatísticas agregadas. Nenhum perfil individual é criado — o sistema não infere posição política de ninguém.
      </p>
    </>
  );
}

function RankPanel({
  title,
  rows,
}: {
  title: string;
  rows: { question_id: string; answers: number; acc: number; q?: { title: string } }[];
}) {
  return (
    <Panel title={title}>
      {rows.length === 0 ? (
        <p className="text-ink/60">Sem respostas ainda.</p>
      ) : (
        <ol className="divide-y-2 divide-ink/15">
          {rows.map((r) => (
            <li key={r.question_id} className="flex items-center gap-3 py-2.5">
              <span className="display w-16 text-3xl">{Math.round(r.acc)}%</span>
              <Link href={`/admin/perguntas/${r.question_id}`} className="min-w-0 flex-1 truncate font-semibold hover:text-red">
                {r.q?.title}
              </Link>
              <span className="label text-ink/50">{r.answers} resp.</span>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}
