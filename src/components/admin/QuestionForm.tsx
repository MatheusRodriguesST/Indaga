"use client";

import { AlertTriangle, CheckCircle2, Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { saveQuestion } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { CLAIM_LABEL, DIFFICULTY_LABEL, SENSITIVE_TERMS, SOURCE_LABEL } from "@/lib/labels";
import {
  CLAIM_KINDS,
  DIFFICULTIES,
  OPTION_LABELS,
  SOURCE_TYPES,
  type Category,
  type ClaimKind,
  type QuestionFull,
  type SourceType,
} from "@/types/domain";
import { Field, FormSection, Input, Select, Textarea } from "./fields";

type SourceRow = { title: string; url: string; source_type: SourceType; publisher: string; publication_date: string; description: string };
type LawRow = { title: string; article: string; url: string; description: string; relevance: string };

function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const emptySource = (): SourceRow => ({ title: "", url: "", source_type: "primaria", publisher: "", publication_date: "", description: "" });
const emptyLaw = (): LawRow => ({ title: "", article: "", url: "", description: "", relevance: "" });

export function QuestionForm({ categories, initial }: { categories: Category[]; initial?: QuestionFull }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ errors: string[]; warnings: string[]; saved?: boolean } | null>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [questionText, setQuestionText] = useState(initial?.question_text ?? "");
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? categories[0]?.id ?? "");
  const [difficulty, setDifficulty] = useState(initial?.difficulty ?? "medio");
  const [period, setPeriod] = useState(initial?.period ?? "");
  const [collection, setCollection] = useState(initial?.collection ?? "quem-disse");
  const [revealAnswer, setRevealAnswer] = useState(initial?.reveal_answer ?? "");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [isDemo, setIsDemo] = useState(initial?.is_demo ?? false);
  const [options, setOptions] = useState(
    OPTION_LABELS.map((l) => {
      const o = initial?.options.find((x) => x.option_label === l);
      return { option_label: l, option_text: o?.option_text ?? "", is_correct: o?.is_correct ?? false };
    }),
  );
  const [shortExp, setShortExp] = useState(initial?.short_explanation ?? "");
  const [longExp, setLongExp] = useState(initial?.long_explanation ?? "");
  const [legalKind, setLegalKind] = useState<ClaimKind | "">(initial?.legal_status_kind ?? "");
  const [legalStatus, setLegalStatus] = useState(initial?.legal_status ?? "");
  const [claims, setClaims] = useState(initial?.claims ?? []);
  const [sources, setSources] = useState<SourceRow[]>(
    initial?.sources.map((s) => ({
      title: s.title,
      url: s.url,
      source_type: s.source_type,
      publisher: s.publisher ?? "",
      publication_date: s.publication_date ?? "",
      description: s.description ?? "",
    })) ?? [emptySource()],
  );
  const [laws, setLaws] = useState<LawRow[]>(
    initial?.legislation.map((l) => ({
      title: l.title,
      article: l.article ?? "",
      url: l.url ?? "",
      description: l.description ?? "",
      relevance: l.relevance ?? "",
    })) ?? [],
  );
  const [verifiedAt, setVerifiedAt] = useState(initial?.last_verified_at ?? "");
  const [notes, setNotes] = useState(initial?.editorial_notes ?? "");

  const sensitive = useMemo(() => {
    const hay = `${title} ${questionText} ${shortExp} ${longExp}`.toLowerCase();
    return SENSITIVE_TERMS.filter((t) => hay.includes(t));
  }, [title, questionText, shortExp, longExp]);

  function submit() {
    const payload = {
      slug,
      title,
      question_text: questionText,
      category_id: categoryId,
      difficulty,
      period,
      short_explanation: shortExp,
      long_explanation: longExp,
      legal_status: legalStatus,
      legal_status_kind: legalKind || null,
      claims: claims.filter((c) => c.text.trim()),
      editorial_status: initial?.editorial_status ?? "rascunho",
      editorial_notes: notes,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      is_demo: isDemo,
      collection: collection || "quem-disse",
      reveal_answer: options.some((o) => o.is_correct) ? "" : revealAnswer,
      last_verified_at: verifiedAt,
      options,
      sources: sources.filter((s) => s.title.trim() || s.url.trim()),
      legislation: laws.filter((l) => l.title.trim()),
    };
    startTransition(async () => {
      const res = await saveQuestion(initial?.id ?? null, payload);
      if (!res.ok) {
        setResult({ errors: res.errors, warnings: res.warnings ?? [] });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setResult({ errors: [], warnings: [...res.report.errors.map((e) => `Para publicar: ${e}`), ...res.report.warnings], saved: true });
      if (!initial) router.push(`/admin/perguntas/${res.id}`);
      else router.refresh();
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="grid gap-6"
    >
      {result && (
        <div
          role="status"
          className={cn(
            "border-[3px] border-ink p-4 shadow-hard-sm",
            result.errors.length ? "bg-red text-paper" : result.saved ? "bg-sun" : "bg-white",
          )}
        >
          {result.saved && !result.errors.length && (
            <p className="display-wide flex items-center gap-2 text-xl">
              <CheckCircle2 className="size-6" /> Salvo.
            </p>
          )}
          {result.errors.length > 0 && (
            <>
              <p className="display-wide text-xl">Não foi possível salvar</p>
              <ul className="mt-2 list-disc pl-5">
                {result.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </>
          )}
          {result.warnings.length > 0 && (
            <ul className="mt-2 grid gap-1 text-sm">
              {result.warnings.map((w, i) => (
                <li key={i} className="flex gap-2">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" /> {w}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <FormSection n="01" title="Identificação">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Título interno">
            <Input
              value={title}
              required
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              placeholder="Ex.: Lei de Acesso à Informação"
            />
          </Field>
          <Field label="Slug (ID único)" hint="Gerado a partir do título.">
            <Input
              value={slug}
              required
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              className="font-mono"
            />
          </Field>
          <Field label="Categoria">
            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Dificuldade">
              <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}>
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {DIFFICULTY_LABEL[d]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Período">
              <Input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="Ex.: 2011" />
            </Field>
          </div>
          <Field label="Tags" hint="Separadas por vírgula.">
            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="transparência, lai" />
          </Field>
          <Field label="Coleção" hint="Permite campanhas/QR Codes com bancos diferentes no futuro.">
            <Input value={collection} onChange={(e) => setCollection(e.target.value)} className="font-mono" />
          </Field>
        </div>
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={isDemo} onChange={(e) => setIsDemo(e.target.checked)} className="size-5 accent-red" />
          <span className="label">Marcar como DEMO / EXEMPLO (exibe selo no quiz)</span>
        </label>
      </FormSection>

      <FormSection n="02" title="Pergunta e alternativas">
        <Field label="Pergunta" hint="Factual e verificável. Pode despertar curiosidade, sem linguagem enganosa.">
          <Textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} rows={3} required />
        </Field>
        <fieldset className="grid gap-3">
          <legend className="label mb-2">Alternativas — marque a correta</legend>
          {options.map((o, i) => (
            <div key={o.option_label} className={cn("grid grid-cols-[auto_1fr] items-stretch border-[3px] border-ink", o.is_correct && "bg-sun")}>
              <label className="flex cursor-pointer items-center gap-2 border-r-[3px] border-ink bg-ink px-3 text-sun">
                <input
                  type="radio"
                  name="correct"
                  checked={o.is_correct}
                  onChange={() => setOptions((os) => os.map((x, j) => ({ ...x, is_correct: j === i })))}
                  className="size-4 accent-sun"
                  aria-label={`Alternativa ${o.option_label} é a correta`}
                />
                <span className="display text-2xl">{o.option_label}</span>
              </label>
              <input
                value={o.option_text}
                onChange={(e) => setOptions((os) => os.map((x, j) => (j === i ? { ...x, option_text: e.target.value } : x)))}
                className="h-12 bg-transparent px-3 focus:outline-none"
                placeholder={`Ex.: Governo ${["Lula (2003–2010)", "Dilma (2011–2016)", "Temer (2016–2018)", "Bolsonaro (2019–2022)"][i]}`}
                aria-label={`Texto da alternativa ${o.option_label}`}
              />
            </div>
          ))}
          <p className="text-xs text-ink/60">A ordem é embaralhada para cada participante.</p>
        </fieldset>
        <div className={cn("grid gap-3 border-[3px] border-dashed p-3", options.some((o) => o.is_correct) ? "border-ink/30" : "border-red bg-red/5")}>
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="correct"
              checked={!options.some((o) => o.is_correct)}
              onChange={() => setOptions((os) => os.map((x) => ({ ...x, is_correct: false })))}
              className="size-4 accent-red"
            />
            <span className="label">Pegadinha: nenhuma alternativa é a correta</span>
          </label>
          {!options.some((o) => o.is_correct) && (
            <Field label="Resposta revelada" hint="Aparece depois da resposta: “Nenhuma das alternativas. Quem disse foi: …”">
              <Input value={revealAnswer} onChange={(e) => setRevealAnswer(e.target.value)} placeholder="Luiz Inácio Lula da Silva (PT)" />
            </Field>
          )}
        </div>
      </FormSection>

      <FormSection n="03" title="Explicação">
        <Field label="O que aconteceu? (curta)">
          <Textarea value={shortExp} onChange={(e) => setShortExp(e.target.value)} rows={2} />
        </Field>
        <Field label="Por que essa é a resposta? (detalhada)">
          <Textarea value={longExp} onChange={(e) => setLongExp(e.target.value)} rows={6} />
        </Field>
      </FormSection>

      <FormSection
        n="04"
        title="Natureza da informação e situação jurídica"
        aside={sensitive.length > 0 && <span className="label bg-red px-2 py-1 text-paper">Termos sensíveis: {sensitive.join(", ")}</span>}
      >
        {sensitive.length > 0 && (
          <p className="flex gap-2 border-2 border-dashed border-red bg-red/5 p-3 text-sm">
            <AlertTriangle className="size-5 shrink-0 text-red" />
            O texto usa termos que exigem fonte e contexto. Classifique a informação e descreva a situação jurídica. Nunca
            apresente investigação como condenação nem acusação como crime comprovado.
          </p>
        )}
        <div className="grid gap-4 md:grid-cols-[260px_1fr]">
          <Field label="Classificação principal">
            <Select value={legalKind} onChange={(e) => setLegalKind(e.target.value as ClaimKind | "")}>
              <option value="">— selecione —</option>
              {CLAIM_KINDS.map((k) => (
                <option key={k} value={k}>
                  {CLAIM_LABEL[k]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Situação jurídica (descrição objetiva)">
            <Textarea value={legalStatus} onChange={(e) => setLegalStatus(e.target.value)} rows={2} placeholder="Ex.: Denúncia recebida pelo STF em AAAA; processo em andamento." />
          </Field>
        </div>

        <div className="grid gap-3">
          <p className="label">Afirmações classificadas (fato × alegação × interpretação)</p>
          {claims.map((c, i) => (
            <div key={i} className="grid gap-2 md:grid-cols-[220px_1fr_auto]">
              <Select value={c.kind} onChange={(e) => setClaims((cs) => cs.map((x, j) => (j === i ? { ...x, kind: e.target.value as ClaimKind } : x)))}>
                {CLAIM_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {CLAIM_LABEL[k]}
                  </option>
                ))}
              </Select>
              <Input value={c.text} onChange={(e) => setClaims((cs) => cs.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))} />
              <RemoveButton onClick={() => setClaims((cs) => cs.filter((_, j) => j !== i))} />
            </div>
          ))}
          <AddButton onClick={() => setClaims((cs) => [...cs, { kind: "fato_documentado", text: "" }])}>Adicionar afirmação</AddButton>
        </div>
      </FormSection>

      <FormSection n="05" title="Fontes" aside={<span className="label text-ink/60">Primária primeiro</span>}>
        {sources.map((s, i) => (
          <div key={i} className={cn("grid gap-3 border-2 border-ink/30 p-3", s.source_type === "primaria" && "border-l-[8px] border-l-ink")}>
            <div className="grid gap-3 md:grid-cols-[200px_1fr_auto]">
              <Select value={s.source_type} onChange={(e) => setSources((xs) => xs.map((x, j) => (j === i ? { ...x, source_type: e.target.value as SourceType } : x)))}>
                {SOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {SOURCE_LABEL[t]}
                  </option>
                ))}
              </Select>
              <Input placeholder="Título do documento/matéria" value={s.title} onChange={(e) => setSources((xs) => xs.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
              <RemoveButton onClick={() => setSources((xs) => xs.filter((_, j) => j !== i))} />
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_200px_170px]">
              <Input type="url" placeholder="https://" value={s.url} onChange={(e) => setSources((xs) => xs.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} className="font-mono text-sm" />
              <Input placeholder="Órgão / veículo" value={s.publisher} onChange={(e) => setSources((xs) => xs.map((x, j) => (j === i ? { ...x, publisher: e.target.value } : x)))} />
              <Input type="date" value={s.publication_date} onChange={(e) => setSources((xs) => xs.map((x, j) => (j === i ? { ...x, publication_date: e.target.value } : x)))} aria-label="Data de publicação" />
            </div>
            <Input placeholder="Descrição (opcional)" value={s.description} onChange={(e) => setSources((xs) => xs.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))} />
          </div>
        ))}
        <AddButton onClick={() => setSources((xs) => [...xs, emptySource()])}>Adicionar fonte</AddButton>
      </FormSection>

      <FormSection n="06" title="Legislação relacionada" aside={<span className="label text-ink/60">Só se houver relação real</span>}>
        {laws.map((l, i) => (
          <div key={i} className="grid gap-3 border-2 border-ink/30 p-3">
            <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
              <Input placeholder="Norma (ex.: Constituição Federal)" value={l.title} onChange={(e) => setLaws((xs) => xs.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
              <Input placeholder="Art. / inciso / §" value={l.article} onChange={(e) => setLaws((xs) => xs.map((x, j) => (j === i ? { ...x, article: e.target.value } : x)))} />
              <RemoveButton onClick={() => setLaws((xs) => xs.filter((_, j) => j !== i))} />
            </div>
            <Input type="url" placeholder="URL oficial" value={l.url} onChange={(e) => setLaws((xs) => xs.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} className="font-mono text-sm" />
            <Textarea rows={2} placeholder="Texto resumido do dispositivo" value={l.description} onChange={(e) => setLaws((xs) => xs.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))} />
            <Textarea rows={2} placeholder="Este dispositivo é relevante porque…" value={l.relevance} onChange={(e) => setLaws((xs) => xs.map((x, j) => (j === i ? { ...x, relevance: e.target.value } : x)))} />
          </div>
        ))}
        <AddButton onClick={() => setLaws((xs) => [...xs, emptyLaw()])}>Adicionar norma</AddButton>
      </FormSection>

      <FormSection n="07" title="Controle editorial">
        <div className="grid gap-4 md:grid-cols-[220px_1fr]">
          <Field label="Última verificação das fontes">
            <Input type="date" value={verifiedAt} onChange={(e) => setVerifiedAt(e.target.value)} />
          </Field>
          <Field label="Observações editoriais (internas)">
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </Field>
        </div>
      </FormSection>

      <div className="sticky bottom-0 z-20 -mx-5 border-t-[3px] border-ink bg-paper/95 px-5 py-4 backdrop-blur">
        <Button type="submit" size="lg" disabled={pending} icon={<Save className="size-5" strokeWidth={2.5} />}>
          {pending ? "Salvando…" : initial ? "Salvar alterações" : "Criar rascunho"}
        </Button>
      </div>
    </form>
  );
}

function AddButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="label inline-flex w-fit items-center gap-1.5 border-2 border-dashed border-ink px-3 py-2 hover:bg-sun-soft">
      <Plus className="size-4" /> {children}
    </button>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex h-12 w-12 items-center justify-center border-[3px] border-ink hover:bg-red hover:text-paper" aria-label="Remover">
      <Trash2 className="size-5" />
    </button>
  );
}
