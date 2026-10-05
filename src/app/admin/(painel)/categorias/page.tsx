import { CategoryForm } from "@/components/admin/CategoryForm";
import { PageTitle, Panel } from "@/components/admin/ui";
import { repo } from "@/server/repo";

export const dynamic = "force-dynamic";

export default async function CategoriasPage() {
  const r = repo();
  const [cats, questions] = await Promise.all([r.listCategories(), r.listQuestions()]);
  return (
    <>
      <PageTitle kicker="Organização" title="Categorias" />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <ul className="grid gap-3 sm:grid-cols-2">
          {cats.map((c) => {
            const n = questions.filter((q) => q.category_id === c.id).length;
            return (
              <li key={c.id} className="flex items-center gap-4 border-[3px] border-ink bg-white p-4 shadow-hard-sm">
                <span className="text-4xl" aria-hidden>
                  {c.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="display-wide truncate text-lg leading-tight">{c.name}</p>
                  <p className="label mt-1 text-ink/50">{c.slug}</p>
                </div>
                <span className="display text-4xl">{n}</span>
              </li>
            );
          })}
        </ul>
        <Panel title="Nova categoria" className="h-fit">
          <CategoryForm />
        </Panel>
      </div>
    </>
  );
}
