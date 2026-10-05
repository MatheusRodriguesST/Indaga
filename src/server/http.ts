import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { QuizError } from "./quiz";

/**
 * Proteção básica de CSRF para as rotas JSON: exige Content-Type JSON
 * (não pode ser enviado por <form> simples) e Origin do mesmo host.
 */
export function guardRequest(req: Request, bucket: string, limit = 30, windowMs = 60_000): NextResponse | null {
  const ct = req.headers.get("content-type") ?? "";
  if (req.method !== "GET" && !ct.includes("application/json")) {
    return NextResponse.json({ error: "Content-Type inválido." }, { status: 415 });
  }
  const origin = req.headers.get("origin");
  if (origin && req.method !== "GET") {
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    try {
      if (new URL(origin).host !== host) return NextResponse.json({ error: "Origem não permitida." }, { status: 403 });
    } catch {
      return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
    }
  }
  const rl = rateLimit(`${bucket}:${clientKey(req)}`, limit, windowMs);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Muitas requisições. Respire e tente de novo." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }
  return null;
}

export async function parseJson<T extends z.ZodType>(req: Request, schema: T): Promise<z.infer<T>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new QuizError("JSON inválido.");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new QuizError(parsed.error.issues[0]?.message ?? "Dados inválidos.");
  return parsed.data;
}

export function errorResponse(err: unknown) {
  if (err instanceof QuizError) return NextResponse.json({ error: err.message }, { status: err.status });
  console.error(err);
  return NextResponse.json({ error: "Erro interno. Tente novamente." }, { status: 500 });
}

export const uuid = z.string().uuid("Identificador inválido.");
