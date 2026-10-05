import Link from "next/link";
import { PageTitle, StatusBadge } from "@/components/admin/ui";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { DIFFICULTY_LABEL, STATUS_LABEL, formatDateBR } from "@/lib/labels";
import { repo } from "@/server/repo";
import { EDITORIAL_STATUSES, type EditorialStatus } from "@/types/domain";

export const dynamic = "force-dynamic";

export default async function PerguntasPage({ searchParams }: PageProps<"/admin/perguntas">) {
  const sp = await searchParams;
  const status = EDITORIAL_STATUSES.includes(sp.status as EditorialStatus) ? (sp.status as EditorialStatus) : undefined;
  const r = repo();
  const [all, stats] = await Promise.all([r.listQuestions(), r.stats()]);
  const list = status ? all.filter((q) => q.editorial_status === status) : all;

  return (
    <>
      <PageTitle kicker="Banco editorial" title="Perguntas" actions={<ButtonLink href="/admin/perguntas/nova" size="md">Nova pergunta</ButtonLink>} />

      <nav className="mb-6 flex flex-wrap gap-2" aria-label="Filtrar por status">
        <Tab href="/admin/perguntas" active={!status} label={`Todas (${all.length})`} />
        {EDITORIAL_STATUSES.map((s) => (
          <Tab
            key={s}
            href={`/admin/perguntas?status=${s}`}
            active={status === s}
            label={`${STATUS_LABEL[s]} (${all.filter((q) => q.editorial_status === s).length})`}
          />
        ))}
      </nav>

      {list.length === 0 ? (
        <p className="border-[3px] border-dashed border-ink/40 p-10 text-center text-ink/60">Nada por aqui.</p>
      ) : (
        <ul className="grid gap-3">
          {list.map((q) => {
            const st = stats.per_question.find((p) => p.question_id === q.id);
            return (
              <li key={q.id}>
                <Link
                  href={`/admin/perguntas/${q.id}`}
                  className="press grid gap-3 border-[3px] border-ink bg-white p-4 shadow-hard-sm hover:bg-sun-soft md:grid-cols-[1fr_auto] md:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={q.editorial_status} />
                      {q.category && (
                        <Badge tone="paper">
                          {q.category.emoji} {q.category.name}
                        </Badge>
                      )}
                      <Badge tone="outline">{DIFFICULTY_LABEL[q.difficulty]}</Badge>
                      {q.is_demo && <Badge tone="red">Demo</Badge>}
                    </div>
                    <p className="display-wide mt-2 text-xl leading-tight">{q.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-ink/70">{q.question_text}</p>
                  </div>
                  <dl className="label grid grid-cols-3 gap-4 text-ink/60 md:text-right">
                    <div>
                      <dt>Fontes</dt>
                      <dd className={cn("display mt-1 text-3xl", q.source_count === 0 ? "text-red" : "text-ink")}>{q.source_count}</dd>
                    </div>
                    <div>
                      <dt>Acerto</dt>
                      <dd className="display mt-1 text-3xl text-ink">{st?.answers ? `${Math.round((100 * st.correct) / st.answers)}%` : "—"}</dd>
                    </div>
                    <div>
                      <dt>Verif.</dt>
                      <dd className="mt-2 text-ink">{formatDateBR(q.last_verified_at)}</dd>
                    </div>
                  </dl>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function Tab({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn("label border-2 border-ink px-3 py-2", active ? "bg-ink text-sun" : "bg-white hover:bg-sun-soft")}
    >
      {label}
    </Link>
  );
}
