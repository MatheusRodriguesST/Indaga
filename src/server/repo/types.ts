import type {
  Category,
  EditorialReview,
  EditorialStatus,
  Legislation,
  Question,
  QuestionFull,
  QuestionOption,
  QuizAnswer,
  QuizSession,
  Source,
} from "@/types/domain";

export type QuestionInput = Omit<Question, "id" | "created_at" | "updated_at"> & {
  options: Omit<QuestionOption, "id" | "question_id">[];
  sources: Omit<Source, "id" | "question_id">[];
  legislation: Omit<Legislation, "id" | "question_id">[];
};

export interface PoolItem {
  id: string;
  category_id: string;
  difficulty: Question["difficulty"];
}

export interface QuestionListItem extends Question {
  category: Category | null;
  source_count: number;
}

export interface AggregateStats {
  sessions: number;
  completed: number;
  avg_score: number | null;
  avg_accuracy: number | null;
  per_question: { question_id: string; answers: number; correct: number }[];
}

/**
 * Camada de dados. Duas implementações:
 *  - Supabase (produção) — quando as variáveis de ambiente existem;
 *  - Memória (modo demonstração) — permite ver o site sem banco configurado.
 */
export interface Repo {
  readonly kind: "supabase" | "memory";

  listCategories(): Promise<Category[]>;
  createCategory(input: Omit<Category, "id">): Promise<Category>;

  listPool(collection?: string): Promise<PoolItem[]>;
  getQuestionsFull(ids: string[]): Promise<QuestionFull[]>;
  getQuestionFull(id: string): Promise<QuestionFull | null>;
  listQuestions(filter?: { status?: EditorialStatus }): Promise<QuestionListItem[]>;
  createQuestion(input: QuestionInput): Promise<string>;
  updateQuestion(id: string, input: QuestionInput): Promise<void>;
  deleteQuestion(id: string): Promise<void>;
  setStatus(id: string, to: EditorialStatus, note: string | null): Promise<void>;
  listReviews(questionId: string): Promise<EditorialReview[]>;

  createSession(input: Omit<QuizSession, "id" | "started_at" | "completed_at" | "score">): Promise<QuizSession>;
  getSession(id: string): Promise<QuizSession | null>;
  getAnswers(sessionId: string): Promise<QuizAnswer[]>;
  /** Deve falhar (retornar null) se a pergunta já foi respondida nesta sessão. */
  insertAnswer(input: Omit<QuizAnswer, "id" | "answered_at">): Promise<QuizAnswer | null>;
  completeSession(id: string, score: number): Promise<void>;

  stats(): Promise<AggregateStats>;
}
