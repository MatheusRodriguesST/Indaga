import "server-only";
import { randomInt } from "node:crypto";
import { QUIZ_CONFIG } from "@/config/brand";
import { OPTION_LABELS } from "@/types/domain";
import type { PublicQuestion, QuestionFull, QuizAnswer, QuizSession, Reveal, SessionState } from "@/types/domain";
import { repo } from "./repo";
import type { PoolItem } from "./repo/types";

export class QuizError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

/** Fisher–Yates com gerador criptográfico. */
export function shuffle<T>(input: readonly T[]): T[] {
  const a = [...input];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Sorteio com diversidade:
 * 1. prefere perguntas que o navegador não viu recentemente;
 * 2. dentro disso, tenta não repetir categoria;
 * 3. se faltar pergunta "nova", completa com as vistas há mais tempo.
 */
export function pickQuestions(pool: PoolItem[], size: number, recent: string[]): string[] {
  const recentSet = new Set(recent);
  const fresh = shuffle(pool.filter((p) => !recentSet.has(p.id)));
  const picked: PoolItem[] = [];
  const usedCats = new Set<string>();

  for (const p of fresh) {
    if (picked.length >= size) break;
    if (!usedCats.has(p.category_id)) {
      picked.push(p);
      usedCats.add(p.category_id);
    }
  }
  for (const p of fresh) {
    if (picked.length >= size) break;
    if (!picked.includes(p)) picked.push(p);
  }
  if (picked.length < size) {
    // `recent` vem do mais novo para o mais antigo → reaproveita os mais antigos primeiro
    const byAge = [...recent].reverse();
    for (const id of byAge) {
      if (picked.length >= size) break;
      const p = pool.find((x) => x.id === id);
      if (p && !picked.includes(p)) picked.push(p);
    }
  }
  return shuffle(picked.map((p) => p.id));
}

function toPublic(q: QuestionFull, order: string[] | undefined): PublicQuestion {
  const ids = order?.length ? order : q.options.map((o) => o.id);
  const options = ids
    .map((id) => q.options.find((o) => o.id === id))
    .filter((o): o is QuestionFull["options"][number] => !!o)
    .map((o, i) => ({ id: o.id, label: OPTION_LABELS[i], text: o.option_text }));
  return {
    id: q.id,
    question_text: q.question_text,
    difficulty: q.difficulty,
    category: q.category ? { name: q.category.name, emoji: q.category.emoji, slug: q.category.slug } : null,
    options,
    is_demo: q.is_demo,
  };
}

function buildReveal(q: QuestionFull, answer: QuizAnswer): Reveal {
  const correct = q.options.find((o) => o.is_correct) ?? null;
  // Pegadinha: nenhuma alternativa está certa e a resposta vem de reveal_answer.
  const correctText = correct?.option_text ?? q.reveal_answer;
  if (!correctText) throw new QuizError("Pergunta sem alternativa correta cadastrada.", 500);
  const strip = <T extends { question_id: string }>({ question_id: _q, ...rest }: T) => rest;
  // fontes primárias primeiro (seção 15)
  const rank = { primaria: 0, jornalistica: 1, analise: 2, academica: 3 } as const;
  return {
    question_id: q.id,
    selected_option_id: answer.selected_option_id,
    correct_option_id: correct?.id ?? null,
    is_correct: answer.is_correct,
    is_trick: !correct,
    correct_text: correctText,
    title: q.title,
    period: q.period,
    short_explanation: q.short_explanation,
    long_explanation: q.long_explanation,
    legal_status: q.legal_status,
    legal_status_kind: q.legal_status_kind,
    claims: q.claims ?? [],
    sources: [...q.sources].sort((a, b) => rank[a.source_type] - rank[b.source_type]).map(strip),
    legislation: q.legislation.map(strip),
    last_verified_at: q.last_verified_at,
  };
}

async function loadSession(id: string): Promise<QuizSession> {
  const s = await repo().getSession(id);
  if (!s) throw new QuizError("Sessão não encontrada.", 404);
  return s;
}

function stateOf(session: QuizSession, questions: QuestionFull[], answers: QuizAnswer[]): SessionState {
  const reveals: Record<string, Reveal> = {};
  for (const a of answers) {
    const q = questions.find((x) => x.id === a.question_id);
    if (q) reveals[q.id] = buildReveal(q, a);
  }
  return {
    session_id: session.id,
    display_name: session.display_name,
    questions: questions.map((q) => toPublic(q, session.option_order[q.id])),
    reveals,
    completed: !!session.completed_at,
    score: session.score,
    total: questions.length,
  };
}

export async function createSession(input: {
  anonymousId: string;
  displayName: string | null;
  campaign: string | null;
  recent: string[];
  device?: string | null;
  referrer?: string | null;
}): Promise<SessionState> {
  const r = repo();
  // /desafio/<campanha> usa a coleção de mesmo nome, se existir; senão a padrão.
  const campaignPool = input.campaign ? await r.listPool(input.campaign) : [];
  const pool = campaignPool.length ? campaignPool : await r.listPool(QUIZ_CONFIG.collection || undefined);
  if (pool.length === 0) throw new QuizError("Ainda não há perguntas publicadas.", 503);

  const ids = pickQuestions(pool, Math.min(QUIZ_CONFIG.quizSize, pool.length), input.recent);
  const questions = await r.getQuestionsFull(ids);
  const option_order = Object.fromEntries(questions.map((q) => [q.id, shuffle(q.options.map((o) => o.id))]));

  const session = await r.createSession({
    anonymous_identifier: input.anonymousId,
    display_name: input.displayName,
    campaign: input.campaign,
    device: input.device ?? null,
    referrer: input.referrer ?? null,
    question_ids: questions.map((q) => q.id),
    option_order,
  });
  return stateOf(session, questions, []);
}

export async function getSessionState(sessionId: string): Promise<SessionState> {
  const session = await loadSession(sessionId);
  const r = repo();
  const [questions, answers] = await Promise.all([r.getQuestionsFull(session.question_ids), r.getAnswers(session.id)]);
  return stateOf(session, questions, answers);
}

export async function answerQuestion(
  sessionId: string,
  questionId: string,
  optionId: string,
): Promise<{ reveal: Reveal; completed: boolean; score: number | null }> {
  const r = repo();
  const session = await loadSession(sessionId);
  if (!session.question_ids.includes(questionId)) throw new QuizError("Pergunta não pertence a esta sessão.");

  const q = await r.getQuestionFull(questionId);
  if (!q) throw new QuizError("Pergunta não encontrada.", 404);
  const option = q.options.find((o) => o.id === optionId);
  if (!option) throw new QuizError("Alternativa inválida.");

  let answer = await r.insertAnswer({
    session_id: session.id,
    question_id: q.id,
    selected_option_id: option.id,
    is_correct: option.is_correct,
  });
  if (!answer) {
    // Já respondida: devolve a resposta registrada (idempotente, impede trocar a escolha).
    const existing = (await r.getAnswers(session.id)).find((a) => a.question_id === q.id);
    if (!existing) throw new QuizError("Não foi possível registrar a resposta.", 409);
    answer = existing;
  }

  const answers = await r.getAnswers(session.id);
  let completed = !!session.completed_at;
  let score = session.score;
  if (!completed && answers.length >= session.question_ids.length) {
    score = answers.filter((a) => a.is_correct).length;
    await r.completeSession(session.id, score);
    completed = true;
  }
  return { reveal: buildReveal(q, answer), completed, score };
}
