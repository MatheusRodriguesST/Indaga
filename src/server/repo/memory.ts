import "server-only";
import { randomUUID } from "node:crypto";
import { SEED_CATEGORIES, SEED_QUESTIONS } from "@/content/seed";
import { OPTION_LABELS } from "@/types/domain";
import type {
  Category,
  EditorialReview,
  Legislation,
  Question,
  QuestionOption,
  QuizAnswer,
  QuizSession,
  Source,
} from "@/types/domain";
import type { Repo, QuestionInput } from "./types";

interface Store {
  categories: Category[];
  questions: Question[];
  options: QuestionOption[];
  sources: Source[];
  legislation: Legislation[];
  sessions: QuizSession[];
  answers: QuizAnswer[];
  reviews: EditorialReview[];
}

const now = () => new Date().toISOString();

function seedStore(): Store {
  const s: Store = { categories: [], questions: [], options: [], sources: [], legislation: [], sessions: [], answers: [], reviews: [] };
  for (const c of SEED_CATEGORIES) s.categories.push({ id: randomUUID(), ...c });
  for (const q of SEED_QUESTIONS) {
    const id = randomUUID();
    const cat = s.categories.find((c) => c.slug === q.category);
    s.questions.push({
      id,
      slug: q.slug,
      title: q.title,
      question_text: q.question_text,
      category_id: cat?.id ?? s.categories[0].id,
      difficulty: q.difficulty,
      period: q.period,
      short_explanation: q.short_explanation,
      long_explanation: q.long_explanation,
      legal_status: q.legal_status,
      legal_status_kind: q.legal_status_kind,
      claims: q.claims,
      reveal_answer: q.reveal_answer ?? null,
      editorial_status: "publicada",
      editorial_notes: q.editorial_notes ?? null,
      tags: q.tags,
      is_demo: q.is_demo ?? false,
      collection: q.collection,
      created_at: now(),
      updated_at: now(),
      last_verified_at: "2026-10-05",
    });
    q.options.forEach((text, i) =>
      s.options.push({ id: randomUUID(), question_id: id, option_label: OPTION_LABELS[i], option_text: text, is_correct: q.correct !== null && i === q.correct }),
    );
    q.sources.forEach((src) =>
      s.sources.push({ id: randomUUID(), question_id: id, description: src.description ?? null, ...src }),
    );
    q.legislation.forEach((l) =>
      s.legislation.push({
        id: randomUUID(),
        question_id: id,
        title: l.title,
        article: l.article ?? null,
        url: l.url ?? null,
        description: l.description ?? null,
        relevance: l.relevance ?? null,
      }),
    );
  }
  return s;
}

// Sobrevive ao hot-reload do `next dev`.
const g = globalThis as unknown as { __gabaritoStore?: Store };
const db = (g.__gabaritoStore ??= seedStore());

function removeChildren(id: string) {
  db.options = db.options.filter((o) => o.question_id !== id);
  db.sources = db.sources.filter((o) => o.question_id !== id);
  db.legislation = db.legislation.filter((o) => o.question_id !== id);
}

function writeChildren(id: string, input: QuestionInput) {
  removeChildren(id);
  input.options.forEach((o) => db.options.push({ id: randomUUID(), question_id: id, ...o }));
  input.sources.forEach((o) => db.sources.push({ id: randomUUID(), question_id: id, ...o }));
  input.legislation.forEach((o) => db.legislation.push({ id: randomUUID(), question_id: id, ...o }));
}

function full(q: Question) {
  return {
    ...q,
    category: db.categories.find((c) => c.id === q.category_id) ?? null,
    options: db.options.filter((o) => o.question_id === q.id).sort((a, b) => a.option_label.localeCompare(b.option_label)),
    sources: db.sources.filter((o) => o.question_id === q.id),
    legislation: db.legislation.filter((o) => o.question_id === q.id),
  };
}

export const memoryRepo: Repo = {
  kind: "memory",

  async listCategories() {
    return [...db.categories].sort((a, b) => a.sort_order - b.sort_order);
  },
  async createCategory(input) {
    const c = { id: randomUUID(), ...input };
    db.categories.push(c);
    return c;
  },

  async listPool(collection) {
    return db.questions
      .filter((q) => q.editorial_status === "publicada" && (!collection || q.collection === collection))
      .map((q) => ({ id: q.id, category_id: q.category_id, difficulty: q.difficulty }));
  },
  async getQuestionsFull(ids) {
    return ids.map((id) => db.questions.find((q) => q.id === id)).filter((q): q is Question => !!q).map(full);
  },
  async getQuestionFull(id) {
    const q = db.questions.find((x) => x.id === id);
    return q ? full(q) : null;
  },
  async listQuestions(filter) {
    return db.questions
      .filter((q) => !filter?.status || q.editorial_status === filter.status)
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      .map((q) => ({
        ...q,
        category: db.categories.find((c) => c.id === q.category_id) ?? null,
        source_count: db.sources.filter((s) => s.question_id === q.id).length,
      }));
  },
  async createQuestion(input) {
    const id = randomUUID();
    const { options: _o, sources: _s, legislation: _l, ...rest } = input;
    db.questions.push({ ...rest, id, created_at: now(), updated_at: now() });
    writeChildren(id, input);
    return id;
  },
  async updateQuestion(id, input) {
    const i = db.questions.findIndex((q) => q.id === id);
    if (i < 0) throw new Error("Pergunta não encontrada");
    const { options: _o, sources: _s, legislation: _l, ...rest } = input;
    db.questions[i] = { ...db.questions[i], ...rest, updated_at: now() };
    writeChildren(id, input);
  },
  async deleteQuestion(id) {
    db.questions = db.questions.filter((q) => q.id !== id);
    removeChildren(id);
  },
  async setStatus(id, to, note) {
    const q = db.questions.find((x) => x.id === id);
    if (!q) throw new Error("Pergunta não encontrada");
    db.reviews.push({ id: randomUUID(), question_id: id, from_status: q.editorial_status, to_status: to, note, created_at: now() });
    q.editorial_status = to;
    q.updated_at = now();
  },
  async listReviews(questionId) {
    return db.reviews.filter((r) => r.question_id === questionId).sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  async createSession(input) {
    const s: QuizSession = { ...input, id: randomUUID(), started_at: now(), completed_at: null, score: null };
    db.sessions.push(s);
    return s;
  },
  async getSession(id) {
    return db.sessions.find((s) => s.id === id) ?? null;
  },
  async getAnswers(sessionId) {
    return db.answers.filter((a) => a.session_id === sessionId);
  },
  async insertAnswer(input) {
    if (db.answers.some((a) => a.session_id === input.session_id && a.question_id === input.question_id)) return null;
    const a: QuizAnswer = { ...input, id: randomUUID(), answered_at: now() };
    db.answers.push(a);
    return a;
  },
  async completeSession(id, score) {
    const s = db.sessions.find((x) => x.id === id);
    if (s && !s.completed_at) {
      s.completed_at = now();
      s.score = score;
    }
  },

  async stats() {
    const completed = db.sessions.filter((s) => s.completed_at);
    const per = new Map<string, { answers: number; correct: number }>();
    for (const a of db.answers) {
      const p = per.get(a.question_id) ?? { answers: 0, correct: 0 };
      p.answers++;
      if (a.is_correct) p.correct++;
      per.set(a.question_id, p);
    }
    const totalAnswers = db.answers.length;
    return {
      sessions: db.sessions.length,
      completed: completed.length,
      avg_score: completed.length ? completed.reduce((n, s) => n + (s.score ?? 0), 0) / completed.length : null,
      avg_accuracy: totalAnswers ? (100 * db.answers.filter((a) => a.is_correct).length) / totalAnswers : null,
      per_question: [...per].map(([question_id, v]) => ({ question_id, ...v })),
    };
  },
};
