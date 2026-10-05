import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { errorResponse, guardRequest, parseJson, uuid } from "@/server/http";
import { answerQuestion, QuizError } from "@/server/quiz";

const Body = z.object({ questionId: uuid, optionId: uuid });

/** Valida a resposta NO SERVIDOR e só então revela gabarito, explicação e fontes. */
export async function POST(req: NextRequest, ctx: RouteContext<"/api/sessions/[id]/answer">) {
  const blocked = guardRequest(req, "answer", 40);
  if (blocked) return blocked;
  try {
    const { id } = await ctx.params;
    if (!uuid.safeParse(id).success) throw new QuizError("Sessão inválida.", 404);
    const body = await parseJson(req, Body);
    const result = await answerQuestion(id, body.questionId, body.optionId);
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return errorResponse(err);
  }
}
