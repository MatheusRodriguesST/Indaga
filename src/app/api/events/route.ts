import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { errorResponse, guardRequest, parseJson, uuid } from "@/server/http";
import { repo } from "@/server/repo";
import { deviceFromUA } from "@/server/visitor";
import { EVENT_TYPES } from "@/types/domain";

const ANON_COOKIE = "gb_anon";

const Body = z.object({
  type: z.enum(EVENT_TYPES),
  sessionId: uuid.nullable().optional(),
  path: z.string().max(200).optional(),
  campaign: z
    .string()
    .max(40)
    .regex(/^[a-z0-9-]*$/i)
    .nullable()
    .optional(),
  meta: z
    .record(z.string().max(40), z.union([z.string().max(300), z.number(), z.boolean(), z.null()]))
    .optional()
    .refine((m) => !m || Object.keys(m).length <= 8, "meta grande demais"),
});

/** Registra um evento do funil (visitou, viu os gráficos, clicou numa fonte…). */
export async function POST(req: NextRequest) {
  const blocked = guardRequest(req, "events", 90);
  if (blocked) return blocked;
  try {
    const body = await parseJson(req, Body);
    const anon = req.cookies.get(ANON_COOKIE)?.value;
    const anonymousId = anon && /^[0-9a-f-]{36}$/.test(anon) ? anon : randomUUID();

    // só associa a sessão se ela existir (evita lixo/forja)
    const sessionId = body.sessionId && (await repo().getSession(body.sessionId)) ? body.sessionId : null;

    await repo().insertEvent({
      session_id: sessionId,
      anonymous_identifier: anonymousId,
      type: body.type,
      path: body.path ?? null,
      campaign: body.campaign?.toLowerCase() || null,
      device: deviceFromUA(req.headers.get("user-agent")),
      meta: body.meta ?? {},
    });

    const res = new NextResponse(null, { status: 204 });
    if (!anon) {
      res.cookies.set(ANON_COOKIE, anonymousId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 180,
        path: "/",
      });
    }
    return res;
  } catch (err) {
    return errorResponse(err);
  }
}
