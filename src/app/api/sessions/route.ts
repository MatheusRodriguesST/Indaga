import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { QUIZ_CONFIG } from "@/config/brand";
import { errorResponse, guardRequest, parseJson, uuid } from "@/server/http";
import { createSession } from "@/server/quiz";

const ANON_COOKIE = "gb_anon";

const Body = z.object({
  displayName: z
    .string()
    .trim()
    .max(40, "Nome muito longo (máx. 40).")
    .transform((s) => s.replace(/[<>]/g, "")) // texto puro; React já escapa na renderização
    .nullable()
    .optional(),
  campaign: z
    .string()
    .trim()
    .max(40)
    .regex(/^[a-z0-9-]*$/i, "Campanha inválida.")
    .nullable()
    .optional(),
  recent: z.array(uuid).max(QUIZ_CONFIG.recentMemory * 2).optional(),
});

export async function POST(req: NextRequest) {
  const blocked = guardRequest(req, "session", 12);
  if (blocked) return blocked;
  try {
    const body = await parseJson(req, Body);
    const anon = req.cookies.get(ANON_COOKIE)?.value;
    const anonymousId = anon && /^[0-9a-f-]{36}$/.test(anon) ? anon : randomUUID();

    const state = await createSession({
      anonymousId,
      displayName: body.displayName || null,
      campaign: body.campaign || null,
      recent: body.recent ?? [],
    });

    const res = NextResponse.json(state, { status: 201 });
    res.cookies.set(ANON_COOKIE, anonymousId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 180,
      path: "/",
    });
    return res;
  } catch (err) {
    return errorResponse(err);
  }
}
