/**
 * Tipos de domínio compartilhados entre servidor e cliente.
 * Os tipos "Public*" são os únicos que podem trafegar para o navegador
 * ANTES de o usuário responder (não contêm a alternativa correta).
 */

export const DIFFICULTIES = ["facil", "medio", "dificil"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const EDITORIAL_STATUSES = ["rascunho", "em_revisao", "publicada", "arquivada"] as const;
export type EditorialStatus = (typeof EDITORIAL_STATUSES)[number];

/** Classificação de natureza da informação (seções 3 e 38 do briefing). */
export const CLAIM_KINDS = [
  "fato_documentado",
  "alegacao",
  "investigacao",
  "denuncia",
  "processo",
  "decisao_judicial",
  "condenacao",
  "absolvicao",
  "controversia",
  "interpretacao",
  "opiniao",
] as const;
export type ClaimKind = (typeof CLAIM_KINDS)[number];

export const SOURCE_TYPES = ["primaria", "jornalistica", "analise", "academica"] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export const OPTION_LABELS = ["A", "B", "C", "D"] as const;
export type OptionLabel = (typeof OPTION_LABELS)[number];

export interface Category {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  sort_order: number;
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option_label: OptionLabel;
  option_text: string;
  is_correct: boolean;
}

export interface Source {
  id: string;
  question_id: string;
  title: string;
  url: string;
  source_type: SourceType;
  publisher: string | null;
  publication_date: string | null;
  description: string | null;
}

export interface Legislation {
  id: string;
  question_id: string;
  title: string;
  article: string | null;
  url: string | null;
  description: string | null;
  relevance: string | null;
}

/** Afirmação classificada (fato, alegação, decisão judicial...). */
export interface Claim {
  kind: ClaimKind;
  text: string;
}

export interface Question {
  id: string;
  slug: string;
  title: string;
  question_text: string;
  category_id: string;
  difficulty: Difficulty;
  period: string | null;
  short_explanation: string;
  long_explanation: string;
  legal_status: string | null;
  legal_status_kind: ClaimKind | null;
  claims: Claim[];
  /**
   * Formato "pegadinha": nenhuma alternativa é correta e esta é a resposta
   * revelada depois (ex.: "Luiz Inácio Lula da Silva"). Null = formato normal.
   */
  reveal_answer: string | null;
  editorial_status: EditorialStatus;
  editorial_notes: string | null;
  tags: string[];
  is_demo: boolean;
  collection: string;
  created_at: string;
  updated_at: string;
  last_verified_at: string | null;
}

export interface QuestionFull extends Question {
  category: Category | null;
  options: QuestionOption[];
  sources: Source[];
  legislation: Legislation[];
}

export interface QuizSession {
  id: string;
  anonymous_identifier: string;
  display_name: string | null;
  campaign: string | null;
  question_ids: string[];
  /** Ordem embaralhada das alternativas por pergunta: { [questionId]: optionId[] } */
  option_order: Record<string, string[]>;
  started_at: string;
  completed_at: string | null;
  score: number | null;
}

export interface QuizAnswer {
  id: string;
  session_id: string;
  question_id: string;
  selected_option_id: string;
  is_correct: boolean;
  answered_at: string;
}

export interface EditorialReview {
  id: string;
  question_id: string;
  from_status: EditorialStatus | null;
  to_status: EditorialStatus;
  note: string | null;
  created_at: string;
}

/* ---------- Payloads públicos (navegador) ---------- */

export interface PublicOption {
  id: string;
  /** Letra exibida (A–D) após o embaralhamento. */
  label: OptionLabel;
  text: string;
}

export interface PublicQuestion {
  id: string;
  question_text: string;
  difficulty: Difficulty;
  category: Pick<Category, "name" | "emoji" | "slug"> | null;
  options: PublicOption[];
  is_demo: boolean;
}

export interface Reveal {
  question_id: string;
  selected_option_id: string;
  /** Null quando é pegadinha (nenhuma alternativa estava certa). */
  correct_option_id: string | null;
  is_correct: boolean;
  is_trick: boolean;
  correct_text: string;
  title: string;
  period: string | null;
  short_explanation: string;
  long_explanation: string;
  legal_status: string | null;
  legal_status_kind: ClaimKind | null;
  claims: Claim[];
  sources: Omit<Source, "question_id">[];
  legislation: Omit<Legislation, "question_id">[];
  last_verified_at: string | null;
}

export interface SessionState {
  session_id: string;
  display_name: string | null;
  questions: PublicQuestion[];
  reveals: Record<string, Reveal>;
  completed: boolean;
  score: number | null;
  total: number;
}
