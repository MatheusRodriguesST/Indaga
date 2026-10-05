import "server-only";
import { z } from "zod";
import { SENSITIVE_TERMS } from "@/lib/labels";
import { CLAIM_KINDS, DIFFICULTIES, EDITORIAL_STATUSES, OPTION_LABELS, SOURCE_TYPES } from "@/types/domain";
import type { QuestionInput } from "./repo/types";

const text = (max: number) => z.string().trim().max(max);
const optText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((s) => (s === "" ? null : s))
    .nullable();
const url = z.string().trim().url("URL inválida.").refine((u) => /^https?:\/\//i.test(u), "Use http(s)://");
const optUrl = z
  .string()
  .trim()
  .transform((s) => (s === "" ? null : s))
  .nullable()
  .refine((u) => u === null || /^https?:\/\/\S+$/i.test(u), "URL inválida.");
const optDate = z
  .string()
  .trim()
  .transform((s) => (s === "" ? null : s))
  .nullable()
  .refine((d) => d === null || /^\d{4}-\d{2}-\d{2}$/.test(d), "Data inválida (AAAA-MM-DD).");

export const QuestionSchema = z.object({
  slug: text(80)
    .min(3, "Slug muito curto.")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug: só letras minúsculas, números e hífens."),
  title: text(160).min(3, "Título obrigatório."),
  question_text: text(600).min(10, "Pergunta obrigatória."),
  category_id: z.string().uuid("Escolha uma categoria."),
  difficulty: z.enum(DIFFICULTIES),
  period: optText(60),
  short_explanation: text(600),
  long_explanation: text(6000),
  legal_status: optText(600),
  legal_status_kind: z.enum(CLAIM_KINDS).nullable(),
  claims: z.array(z.object({ kind: z.enum(CLAIM_KINDS), text: text(800).min(1) })).max(20),
  reveal_answer: optText(200),
  editorial_status: z.enum(EDITORIAL_STATUSES),
  editorial_notes: optText(4000),
  tags: z.array(text(40).min(1)).max(20),
  is_demo: z.boolean(),
  collection: text(40).min(1).default("quem-disse"),
  last_verified_at: optDate,
  options: z
    .array(z.object({ option_label: z.enum(OPTION_LABELS), option_text: text(200), is_correct: z.boolean() }))
    .length(4, "São necessárias 4 alternativas."),
  sources: z
    .array(
      z.object({
        title: text(300).min(1, "Título da fonte obrigatório."),
        url,
        source_type: z.enum(SOURCE_TYPES),
        publisher: optText(120),
        publication_date: optDate,
        description: optText(1000),
      }),
    )
    .max(20),
  legislation: z
    .array(
      z.object({
        title: text(300).min(1, "Título da norma obrigatório."),
        article: optText(120),
        url: optUrl,
        description: optText(1000),
        relevance: optText(1000),
      }),
    )
    .max(20),
});

export interface EditorialReport {
  errors: string[];
  warnings: string[];
}

function hasSensitiveTerm(input: QuestionInput): string[] {
  const hay = [input.title, input.question_text, input.short_explanation, input.long_explanation]
    .join(" ")
    .toLowerCase();
  return SENSITIVE_TERMS.filter((t) => hay.includes(t));
}

/**
 * Regras editoriais que BLOQUEIAM a publicação (seções 3, 15, 21, 35 e 38).
 * Rascunhos podem ser salvos incompletos; publicar exige tudo isto.
 */
export function checkPublishable(input: QuestionInput): EditorialReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  const filled = input.options.filter((o) => o.option_text.trim());
  if (filled.length !== 4) errors.push("Preencha as 4 alternativas.");
  const correct = input.options.filter((o) => o.is_correct).length;
  if (correct === 0) {
    if (!input.reveal_answer?.trim())
      errors.push("Nenhuma alternativa correta: preencha a “resposta revelada” (formato pegadinha) ou marque a correta.");
  } else if (correct !== 1) {
    errors.push("Marque exatamente UMA alternativa correta.");
  } else if (input.reveal_answer?.trim()) {
    warnings.push("Há alternativa correta E resposta revelada; a resposta revelada será ignorada.");
  }
  if (new Set(filled.map((o) => o.option_text.trim().toLowerCase())).size !== filled.length)
    errors.push("Há alternativas repetidas.");

  if (!input.short_explanation.trim()) errors.push("Explicação curta (“O que aconteceu?”) é obrigatória.");
  if (!input.long_explanation.trim()) errors.push("Explicação detalhada (“Por que essa é a resposta?”) é obrigatória.");
  if (input.sources.length === 0) errors.push("Toda pergunta publicada precisa de pelo menos uma fonte.");
  if (!input.sources.some((s) => s.source_type === "primaria"))
    warnings.push("Nenhuma fonte primária. Priorize documento oficial quando existir.");
  if (!input.last_verified_at) errors.push("Informe a data da última verificação das fontes.");
  if (!input.legal_status_kind) errors.push("Classifique a natureza da informação (fato, alegação, investigação…).");

  const terms = hasSensitiveTerm(input);
  if (terms.length) {
    if (!input.legal_status?.trim())
      errors.push(`Termos sensíveis (${terms.join(", ")}): descreva a situação jurídica/contexto.`);
    if (input.sources.length < 2)
      warnings.push(`Termos sensíveis (${terms.join(", ")}): recomendável mais de uma fonte independente.`);
  }

  const k = input.legal_status_kind;
  const blob = `${input.question_text} ${input.short_explanation} ${input.long_explanation}`.toLowerCase();
  if (k && ["alegacao", "investigacao", "denuncia", "processo"].includes(k) && /condenad|culpad|crime comprovado/.test(blob))
    errors.push("A classificação é alegação/investigação/denúncia/processo, mas o texto fala em condenação ou culpa. Revise.");
  if (/inconstitucional/.test(blob) && !input.legislation.length)
    errors.push("O texto menciona inconstitucionalidade: cite a norma/decisão na seção de legislação.");

  if (input.is_demo) warnings.push("Pergunta marcada como DEMO/EXEMPLO — aparecerá com selo no quiz.");
  return { errors, warnings };
}
