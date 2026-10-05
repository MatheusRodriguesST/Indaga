import { notFound } from "next/navigation";
import { DeleteQuestionButton } from "@/components/admin/DeleteQuestionButton";
import { QuestionForm } from "@/components/admin/QuestionForm";
import { StatusPanel } from "@/components/admin/StatusPanel";
import { PageTitle, Panel, StatusBadge } from "@/components/admin/ui";
import { STATUS_LABEL, formatDateBR } from "@/lib/labels";
import { checkPublishable } from "@/server/editorial";
import { repo } from "@/server/repo";

export const dynamic = "force-dynamic";

export default async function EditarPerguntaPage({ params }: PageProps<"/admin/perguntas/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const r = repo();
  const [q, categories, reviews, stats] = await Promise.all([r.getQuestionFull(id), r.listCategories(), r.listReviews(id), r.stats()]);
  if (!q) notFound();

  const report = checkPublishable(q);
  const st = stats.per_question.find((p) => p.question_id === id);

  return (
    <>
      <PageTitle kicker={`Pergunta · ${q.slug}`} title={q.title} actions={<StatusBadge status={q.editorial_status} />} />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <QuestionForm categories={categories} initial={q} />

        <aside className="grid content-start gap-6 lg:sticky lg:top-24">
          <Panel title="Fluxo editorial">
            <StatusPanel id={q.id} status={q.editorial_status} />
          </Panel>

          <Panel title="Checagem automática">
            {report.errors.length === 0 && report.warnings.length === 0 ? (
              <p className="font-semibold">Pronta para publicação.</p>
            ) : (
              <ul className="grid gap-2 text-sm">
                {report.errors.map((e, i) => (
                  <li key={`e${i}`} className="border-l-4 border-red pl-2">
                    {e}
                  </li>
                ))}
                {report.warnings.map((w, i) => (
                  <li key={`w${i}`} className="border-l-4 border-sun pl-2 text-ink/75">
                    {w}
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Desempenho">
            <p className="display text-5xl">{st?.answers ? `${Math.round((100 * st.correct) / st.answers)}%` : "—"}</p>
            <p className="label mt-1 text-ink/60">{st?.answers ?? 0} respostas</p>
          </Panel>

          <Panel title="Histórico de revisão">
            {reviews.length === 0 ? (
              <p className="text-sm text-ink/60">Sem movimentações.</p>
            ) : (
              <ol className="grid gap-3 text-sm">
                {reviews.map((rv) => (
                  <li key={rv.id} className="border-l-4 border-ink pl-2">
                    <p className="label">
                      {rv.from_status ? STATUS_LABEL[rv.from_status] : "—"} → {STATUS_LABEL[rv.to_status]}
                    </p>
                    <p className="text-ink/60">{formatDateBR(rv.created_at)}</p>
                    {rv.note && <p className="mt-1">{rv.note}</p>}
                  </li>
                ))}
              </ol>
            )}
          </Panel>

          <DeleteQuestionButton id={q.id} />
        </aside>
      </div>
    </>
  );
}
