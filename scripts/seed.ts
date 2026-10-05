/**
 * Popula o Supabase com as categorias e o banco inicial de perguntas
 * (src/content/seed.ts). Idempotente: perguntas com slug já existente são puladas.
 *
 *   npm run db:seed
 *
 * Requer SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local.
 */
import { createClient } from "@supabase/supabase-js";
import { SEED_CATEGORIES, SEED_QUESTIONS } from "../src/content/seed";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("✗ Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local");
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });
const LABELS = ["A", "B", "C", "D"] as const;
const VERIFIED_AT = "2026-10-05";

async function main() {
  const { error: catErr } = await sb.from("categories").upsert(SEED_CATEGORIES, { onConflict: "slug", ignoreDuplicates: true });
  if (catErr) throw catErr;
  const { data: cats, error } = await sb.from("categories").select("id, slug");
  if (error) throw error;
  const catId = new Map(cats.map((c) => [c.slug, c.id]));

  let created = 0;
  for (const q of SEED_QUESTIONS) {
    const { data: exists } = await sb.from("questions").select("id").eq("slug", q.slug).maybeSingle();
    if (exists) {
      console.log(`· ${q.slug} já existe — pulando`);
      continue;
    }
    const { data: row, error: qErr } = await sb
      .from("questions")
      .insert({
        slug: q.slug,
        title: q.title,
        question_text: q.question_text,
        category_id: catId.get(q.category) ?? null,
        difficulty: q.difficulty,
        period: q.period,
        short_explanation: q.short_explanation,
        long_explanation: q.long_explanation,
        legal_status: q.legal_status,
        legal_status_kind: q.legal_status_kind,
        claims: q.claims,
        reveal_answer: q.reveal_answer ?? null,
        collection: q.collection,
        editorial_status: "publicada",
        editorial_notes: q.editorial_notes ?? null,
        tags: q.tags,
        is_demo: q.is_demo ?? false,
        last_verified_at: VERIFIED_AT,
      })
      .select("id")
      .single();
    if (qErr) throw qErr;

    const id = row.id;
    const ops = await Promise.all([
      sb.from("question_options").insert(
        q.options.map((text, i) => ({ question_id: id, option_label: LABELS[i], option_text: text, is_correct: q.correct !== null && i === q.correct })),
      ),
      sb.from("question_sources").insert(q.sources.map((s, i) => ({ ...s, description: s.description ?? null, question_id: id, sort_order: i }))),
      q.legislation.length
        ? sb.from("legislation").insert(q.legislation.map((l, i) => ({ ...l, question_id: id, sort_order: i })))
        : Promise.resolve({ error: null }),
      sb.from("editorial_reviews").insert({ question_id: id, from_status: null, to_status: "publicada", note: "Importada pelo seed inicial." }),
    ]);
    for (const op of ops) if (op.error) throw op.error;
    created++;
    console.log(`✓ ${q.slug}`);
  }
  console.log(`\nPronto: ${created} pergunta(s) criada(s).`);
}

main().catch((e) => {
  console.error("✗", e.message ?? e);
  process.exit(1);
});
