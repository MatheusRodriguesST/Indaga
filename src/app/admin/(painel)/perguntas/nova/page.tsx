import { QuestionForm } from "@/components/admin/QuestionForm";
import { PageTitle } from "@/components/admin/ui";
import { repo } from "@/server/repo";

export const dynamic = "force-dynamic";

export default async function NovaPerguntaPage() {
  const categories = await repo().listCategories();
  return (
    <>
      <PageTitle kicker="Rascunho" title="Nova pergunta" />
      <p className="mb-6 max-w-2xl text-ink/75">
        Toda pergunta nasce como rascunho e passa por revisão e verificação das fontes antes de ir ao ar. Não invente
        fatos, números, citações ou fontes para preencher o banco.
      </p>
      <QuestionForm categories={categories} />
    </>
  );
}
