"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { ADMIN_COOKIE, checkPassword, issueToken, verifyToken } from "@/server/auth";
import { checkPublishable, QuestionSchema, type EditorialReport } from "@/server/editorial";
import { repo } from "@/server/repo";
import type { QuestionInput } from "@/server/repo/types";
import { EDITORIAL_STATUSES, type EditorialStatus } from "@/types/domain";

async function requireAdmin() {
  const jar = await cookies();
  if (!verifyToken(jar.get(ADMIN_COOKIE)?.value)) redirect("/admin/login");
}

/* ---------------- login / logout ---------------- */

export async function login(_prev: { error?: string } | null, form: FormData): Promise<{ error?: string }> {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  if (!rateLimit(`login:${ip}`, 8, 10 * 60_000).ok) return { error: "Muitas tentativas. Aguarde alguns minutos." };

  const password = String(form.get("password") ?? "");
  if (!checkPassword(password)) return { error: "Senha incorreta." };

  const { value, maxAge } = issueToken();
  (await cookies()).set(ADMIN_COOKIE, value, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

/* ---------------- perguntas ---------------- */

export type SaveResult = { ok: true; id: string; report: EditorialReport } | { ok: false; errors: string[]; warnings?: string[] };

export async function saveQuestion(id: string | null, payload: unknown): Promise<SaveResult> {
  await requireAdmin();
  const parsed = QuestionSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.issues.map((i) => `${i.path.join(".") || "campo"}: ${i.message}`) };
  }
  const input = parsed.data as QuestionInput;
  const report = checkPublishable(input);

  // Uma pergunta publicada não pode ser salva fora das regras editoriais.
  if (input.editorial_status === "publicada" && report.errors.length) {
    return { ok: false, errors: report.errors, warnings: report.warnings };
  }

  const r = repo();
  try {
    if (id) {
      const current = await r.getQuestionFull(id);
      if (!current) return { ok: false, errors: ["Pergunta não encontrada."] };
      // status só muda pelo fluxo editorial (changeStatus), para registrar histórico
      await r.updateQuestion(id, { ...input, editorial_status: current.editorial_status });
    } else {
      id = await r.createQuestion({ ...input, editorial_status: "rascunho" });
    }
  } catch (e) {
    const msg = (e as Error).message;
    return { ok: false, errors: [/duplicate|unique/i.test(msg) ? "Já existe uma pergunta com esse slug." : msg] };
  }
  revalidatePath("/admin", "layout");
  return { ok: true, id, report };
}

const Transition = z.object({
  id: z.string().uuid(),
  to: z.enum(EDITORIAL_STATUSES),
  note: z.string().trim().max(2000).optional(),
  checklist: z.array(z.string()).optional(),
});

const REQUIRED_CHECKS = ["data", "governo", "acontecimento", "fonte", "legislacao", "situacao"];

const ALLOWED: Record<EditorialStatus, EditorialStatus[]> = {
  rascunho: ["em_revisao", "arquivada"],
  em_revisao: ["rascunho", "publicada", "arquivada"],
  publicada: ["em_revisao", "arquivada"],
  arquivada: ["rascunho"],
};

export async function changeStatus(input: z.input<typeof Transition>): Promise<{ ok: boolean; errors?: string[] }> {
  await requireAdmin();
  const p = Transition.safeParse(input);
  if (!p.success) return { ok: false, errors: ["Requisição inválida."] };
  const r = repo();
  const q = await r.getQuestionFull(p.data.id);
  if (!q) return { ok: false, errors: ["Pergunta não encontrada."] };

  if (!ALLOWED[q.editorial_status].includes(p.data.to))
    return { ok: false, errors: [`Não é possível ir de “${q.editorial_status}” para “${p.data.to}”.`] };

  if (p.data.to === "publicada") {
    const missing = REQUIRED_CHECKS.filter((c) => !p.data.checklist?.includes(c));
    if (missing.length) return { ok: false, errors: ["Complete o checklist de verificação das fontes antes de publicar."] };
    const report = checkPublishable(q);
    if (report.errors.length) return { ok: false, errors: report.errors };
  }

  await r.setStatus(q.id, p.data.to, p.data.note || null);
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function deleteQuestion(id: string) {
  await requireAdmin();
  if (!z.string().uuid().safeParse(id).success) return;
  await repo().deleteQuestion(id);
  revalidatePath("/admin", "layout");
  redirect("/admin/perguntas");
}

/* ---------------- categorias ---------------- */

const CategorySchema = z.object({
  name: z.string().trim().min(2).max(60),
  emoji: z.string().trim().min(1).max(8),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug inválido."),
});

export async function createCategory(_prev: { error?: string; ok?: boolean } | null, form: FormData) {
  await requireAdmin();
  const p = CategorySchema.safeParse({ name: form.get("name"), emoji: form.get("emoji"), slug: form.get("slug") });
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Dados inválidos." };
  const r = repo();
  const all = await r.listCategories();
  if (all.some((c) => c.slug === p.data.slug)) return { error: "Já existe uma categoria com esse slug." };
  await r.createCategory({ ...p.data, sort_order: all.length + 1 });
  revalidatePath("/admin", "layout");
  return { ok: true };
}
