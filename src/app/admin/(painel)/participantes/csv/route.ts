import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { formatDateTimeBR, getAnalytics, parsePeriod } from "@/server/analytics";
import { ADMIN_COOKIE, verifyToken } from "@/server/auth";

/** Planilha (CSV, abre no Excel/Google Sheets) com todas as partidas do período. */
export async function GET(req: NextRequest) {
  if (!verifyToken((await cookies()).get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const period = parsePeriod(req.nextUrl.searchParams.get("p"));
  const a = await getAnalytics(period);

  const header = ["nome", "data_hora", "terminou", "acertos", "total", "viu_graficos", "abriu_banco", "cliques_fontes", "compartilhou", "vezes_que_jogou", "campanha", "aparelho", "origem"];
  // evita injeção de fórmula no Excel (=, +, -, @)
  const cell = (v: unknown) => {
    let s = v === null || v === undefined ? "" : String(v);
    if (/^[=+\-@]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const rows = a.participants.map((p) =>
    [
      p.name ?? "Anônimo",
      formatDateTimeBR(p.session.started_at),
      p.completed ? "sim" : "não",
      p.session.score ?? "",
      p.total,
      p.sawNumbers ? "sim" : "não",
      p.openedBanco ? "sim" : "não",
      p.sourceClicks,
      p.shared ? "sim" : "não",
      p.playsByVisitor,
      p.session.campaign ?? "",
      p.session.device ?? "",
      p.session.referrer ?? "direto/QR",
    ]
      .map(cell)
      .join(";"),
  );
  // ";" + BOM: o Excel em português abre com acentos e colunas certas
  const csv = "﻿" + [header.join(";"), ...rows].join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="participantes-${period}-dias.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
