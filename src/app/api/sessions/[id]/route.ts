import { NextResponse, type NextRequest } from "next/server";
import { errorResponse, guardRequest, uuid } from "@/server/http";
import { getSessionState, QuizError } from "@/server/quiz";

/** Retoma uma sessão (ex.: usuário recarregou a página no meio do desafio). */
export async function GET(req: NextRequest, ctx: RouteContext<"/api/sessions/[id]">) {
  const blocked = guardRequest(req, "state", 60);
  if (blocked) return blocked;
  try {
    const { id } = await ctx.params;
    if (!uuid.safeParse(id).success) throw new QuizError("Sessão inválida.", 404);
    return NextResponse.json(await getSessionState(id), { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return errorResponse(err);
  }
}
