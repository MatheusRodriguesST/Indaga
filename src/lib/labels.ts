import type { ClaimKind, Difficulty, EditorialStatus, SourceType } from "@/types/domain";

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  facil: "Fácil",
  medio: "Médio",
  dificil: "Difícil",
};

export const STATUS_LABEL: Record<EditorialStatus, string> = {
  rascunho: "Rascunho",
  em_revisao: "Em revisão",
  publicada: "Publicada",
  arquivada: "Arquivada",
};

export const CLAIM_LABEL: Record<ClaimKind, string> = {
  fato_documentado: "Fato documentado",
  alegacao: "Alegação",
  investigacao: "Investigação",
  denuncia: "Denúncia",
  processo: "Processo",
  decisao_judicial: "Decisão judicial",
  condenacao: "Condenação",
  absolvicao: "Absolvição",
  controversia: "Controvérsia política",
  interpretacao: "Interpretação de especialistas",
  opiniao: "Opinião",
};

/** Tom visual de cada natureza de informação. */
export const CLAIM_TONE: Record<ClaimKind, "solid" | "warn" | "neutral"> = {
  fato_documentado: "solid",
  decisao_judicial: "solid",
  condenacao: "solid",
  absolvicao: "solid",
  processo: "warn",
  denuncia: "warn",
  investigacao: "warn",
  alegacao: "warn",
  controversia: "neutral",
  interpretacao: "neutral",
  opiniao: "neutral",
};

export const SOURCE_LABEL: Record<SourceType, string> = {
  primaria: "Fonte primária",
  jornalistica: "Fonte jornalística",
  analise: "Análise",
  academica: "Pesquisa acadêmica",
};

export const SOURCE_CTA: Record<SourceType, string> = {
  primaria: "Abrir documento",
  jornalistica: "Ler matéria",
  analise: "Ler análise",
  academica: "Ler estudo",
};

/** Termos que exigem fonte + classificação antes de publicar (seção 38). */
export const SENSITIVE_TERMS = [
  "crime",
  "corrupção",
  "corrupcao",
  "ilegal",
  "inconstitucional",
  "fraude",
  "discriminação",
  "discriminacao",
  "censura",
  "perseguição",
  "perseguicao",
  "traição",
  "traicao",
  "venda do brasil",
  "crime contra a soberania",
];

export function formatDateBR(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
