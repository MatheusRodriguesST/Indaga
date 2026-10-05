import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Category, EditorialReview, Question, QuestionFull, QuizAnswer, QuizEvent, QuizSession } from "@/types/domain";
import type { QuestionInput, QuestionListItem, Repo } from "./types";

const QUESTION_COLS =
  "id, slug, title, question_text, category_id, difficulty, period, short_explanation, long_explanation, legal_status, legal_status_kind, claims, reveal_answer, editorial_status, editorial_notes, tags, is_demo, collection, created_at, updated_at, last_verified_at";

const FULL_SELECT = `${QUESTION_COLS},
  category:categories(*),
  options:question_options(*),
  sources:question_sources(*),
  legislation(*)`;

/** O Supabase devolve no máximo 1000 linhas por chamada: pagina até `limit`. */
async function pageAll<T>(
  limit: number,
  query: (from: number, to: number) => PromiseLike<{ data: unknown; error: { message: string } | null }>,
): Promise<T[]> {
  const PAGE = 1000;
  const out: T[] = [];
  for (let from = 0; from < limit; from += PAGE) {
    const to = Math.min(from + PAGE, limit) - 1;
    const rows = unwrap(await query(from, to)) as T[];
    out.push(...rows);
    if (rows.length < to - from + 1) break;
  }
  return out;
}

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(`[supabase] ${res.error.message}`);
  return res.data as T;
}

type FullRow = QuestionFull & { sources: (QuestionFull["sources"][number] & { sort_order?: number })[] };

function normalizeFull(row: FullRow): QuestionFull {
  return {
    ...row,
    options: [...row.options].sort((a, b) => a.option_label.localeCompare(b.option_label)),
    sources: [...row.sources].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    legislation: [...row.legislation],
  };
}

export function createSupabaseRepo(url: string, serviceKey: string): Repo {
  const sb: SupabaseClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  async function writeChildren(id: string, input: QuestionInput) {
    unwrap(await sb.from("question_options").delete().eq("question_id", id));
    unwrap(await sb.from("question_sources").delete().eq("question_id", id));
    unwrap(await sb.from("legislation").delete().eq("question_id", id));
    if (input.options.length)
      unwrap(await sb.from("question_options").insert(input.options.map((o) => ({ ...o, question_id: id }))));
    if (input.sources.length)
      unwrap(await sb.from("question_sources").insert(input.sources.map((s, i) => ({ ...s, question_id: id, sort_order: i }))));
    if (input.legislation.length)
      unwrap(await sb.from("legislation").insert(input.legislation.map((l, i) => ({ ...l, question_id: id, sort_order: i }))));
  }

  function splitInput(input: QuestionInput) {
    const { options: _o, sources: _s, legislation: _l, ...row } = input;
    return row;
  }

  return {
    kind: "supabase",

    async listCategories() {
      return unwrap(await sb.from("categories").select("*").order("sort_order")) as Category[];
    },
    async createCategory(input) {
      return unwrap(await sb.from("categories").insert(input).select("*").single()) as Category;
    },

    async listPool(collection) {
      let q = sb.from("questions").select("id, category_id, difficulty").eq("editorial_status", "publicada");
      if (collection) q = q.eq("collection", collection);
      return unwrap(await q);
    },
    async getQuestionsFull(ids) {
      if (!ids.length) return [];
      const rows = unwrap(await sb.from("questions").select(FULL_SELECT).in("id", ids)) as unknown as FullRow[];
      const byId = new Map(rows.map((r) => [r.id, normalizeFull(r)]));
      return ids.map((id) => byId.get(id)).filter((q): q is QuestionFull => !!q);
    },
    async getQuestionFull(id) {
      const row = unwrap(await sb.from("questions").select(FULL_SELECT).eq("id", id).maybeSingle()) as unknown as FullRow | null;
      return row ? normalizeFull(row) : null;
    },
    async listQuestions(filter) {
      let q = sb
        .from("questions")
        .select(`${QUESTION_COLS}, category:categories(*), sources:question_sources(count)`)
        .order("updated_at", { ascending: false });
      if (filter?.status) q = q.eq("editorial_status", filter.status);
      const rows = unwrap(await q) as unknown as (Question & { category: Category | null; sources: { count: number }[] })[];
      return rows.map(({ sources, ...r }) => ({ ...r, source_count: sources?.[0]?.count ?? 0 })) as QuestionListItem[];
    },
    async createQuestion(input) {
      const row = unwrap(await sb.from("questions").insert(splitInput(input)).select("id").single()) as { id: string };
      await writeChildren(row.id, input);
      return row.id;
    },
    async updateQuestion(id, input) {
      unwrap(await sb.from("questions").update(splitInput(input)).eq("id", id));
      await writeChildren(id, input);
    },
    async deleteQuestion(id) {
      unwrap(await sb.from("questions").delete().eq("id", id));
    },
    async setStatus(id, to, note) {
      const cur = unwrap(await sb.from("questions").select("editorial_status").eq("id", id).single()) as {
        editorial_status: Question["editorial_status"];
      };
      unwrap(await sb.from("questions").update({ editorial_status: to }).eq("id", id));
      unwrap(
        await sb.from("editorial_reviews").insert({ question_id: id, from_status: cur.editorial_status, to_status: to, note }),
      );
    },
    async listReviews(questionId) {
      return unwrap(
        await sb.from("editorial_reviews").select("*").eq("question_id", questionId).order("created_at", { ascending: false }),
      ) as EditorialReview[];
    },

    async createSession(input) {
      return unwrap(await sb.from("quiz_sessions").insert(input).select("*").single()) as QuizSession;
    },
    async getSession(id) {
      return unwrap(await sb.from("quiz_sessions").select("*").eq("id", id).maybeSingle()) as QuizSession | null;
    },
    async getAnswers(sessionId) {
      return unwrap(await sb.from("quiz_answers").select("*").eq("session_id", sessionId)) as QuizAnswer[];
    },
    async insertAnswer(input) {
      const res = await sb.from("quiz_answers").insert(input).select("*").single();
      // 23505 = unique_violation → já respondida
      if (res.error?.code === "23505") return null;
      return unwrap(res) as QuizAnswer;
    },
    async completeSession(id, score) {
      unwrap(
        await sb
          .from("quiz_sessions")
          .update({ completed_at: new Date().toISOString(), score })
          .eq("id", id)
          .is("completed_at", null),
      );
    },

    async insertEvent(input) {
      unwrap(await sb.from("quiz_events").insert(input));
    },
    async listEvents(since, limit = 20000) {
      return pageAll<QuizEvent>(limit, (from, to) =>
        sb.from("quiz_events").select("*").gte("created_at", since).order("created_at", { ascending: false }).range(from, to),
      );
    },
    async listSessions(since, limit = 5000) {
      return pageAll<QuizSession>(limit, (from, to) =>
        sb
          .from("quiz_sessions")
          .select("id, anonymous_identifier, display_name, campaign, question_ids, started_at, completed_at, score, device, referrer")
          .gte("started_at", since)
          .order("started_at", { ascending: false })
          .range(from, to),
      );
    },
    async listAnswers(since, limit = 50000) {
      return pageAll<QuizAnswer>(limit, (from, to) =>
        sb.from("quiz_answers").select("*").gte("answered_at", since).order("answered_at").range(from, to),
      );
    },

    async stats() {
      const [{ count: sessions }, { count: completed }] = await Promise.all([
        sb.from("quiz_sessions").select("id", { count: "exact", head: true }),
        sb.from("quiz_sessions").select("id", { count: "exact", head: true }).not("completed_at", "is", null),
      ]);
      const scores = unwrap(
        await sb.from("quiz_sessions").select("score").not("completed_at", "is", null).limit(10000),
      ) as { score: number }[];
      const per = unwrap(await sb.from("question_stats").select("question_id, answers, correct")) as {
        question_id: string;
        answers: number;
        correct: number;
      }[];
      const totalA = per.reduce((n, p) => n + p.answers, 0);
      const totalC = per.reduce((n, p) => n + p.correct, 0);
      return {
        sessions: sessions ?? 0,
        completed: completed ?? 0,
        avg_score: scores.length ? scores.reduce((n, s) => n + (s.score ?? 0), 0) / scores.length : null,
        avg_accuracy: totalA ? (100 * totalC) / totalA : null,
        per_question: per.filter((p) => p.answers > 0),
      };
    },
  };
}
