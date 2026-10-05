import "server-only";
import { repo } from "./repo";
import type { QuizEvent, QuizSession } from "@/types/domain";

const TZ = "America/Sao_Paulo";

export const PERIODS = { "7": 7, "30": 30, "90": 90, tudo: 3650 } as const;
export type Period = keyof typeof PERIODS;

export function parsePeriod(v: unknown): Period {
  return typeof v === "string" && v in PERIODS ? (v as Period) : "30";
}

const dayKey = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
const hourOf = (iso: string) => Number(new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", hour12: false }).format(new Date(iso))) % 24;

export function formatDateTimeBR(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

export interface Participant {
  session: QuizSession;
  name: string | null;
  total: number;
  completed: boolean;
  sawNumbers: boolean;
  openedBanco: boolean;
  sourceClicks: number;
  shared: boolean;
  playsByVisitor: number;
}

export interface Analytics {
  days: number;
  funnel: { label: string; value: number; hint: string }[];
  totals: {
    visitors: number;
    sessions: number;
    completed: number;
    numbersViews: number;
    named: number;
    returning: number;
    avgSeconds: number | null;
    sourceClicks: number;
    shares: number;
  };
  daily: { day: string; label: string; visitors: number; sessions: number; numbers: number }[];
  hourly: number[];
  devices: { key: string; value: number }[];
  campaigns: { key: string; sessions: number; completed: number; numbers: number }[];
  referrers: { key: string; value: number }[];
  topSources: { host: string; url: string; value: number }[];
  participants: Participant[];
}

function countBy<T>(items: T[], key: (t: T) => string | null | undefined) {
  const m = new Map<string, number>();
  for (const it of items) {
    const k = key(it) || "—";
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m].map(([k, value]) => ({ key: k, value })).sort((a, b) => b.value - a.value);
}

export async function getAnalytics(period: Period): Promise<Analytics> {
  const days = PERIODS[period];
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  const r = repo();
  const [sessions, events] = await Promise.all([r.listSessions(since), r.listEvents(since)]);

  const ofType = (t: QuizEvent["type"]) => events.filter((e) => e.type === t);
  const uniq = (xs: (string | null | undefined)[]) => new Set(xs.filter(Boolean)).size;

  const numbersEvents = ofType("numbers_view");
  const bancoEvents = ofType("banco_view");
  const sourceEvents = ofType("source_click");
  const shareEvents = ofType("share_click");

  const numbersBySession = new Set(numbersEvents.map((e) => e.session_id).filter(Boolean) as string[]);
  const bancoByVisitor = new Set(bancoEvents.map((e) => e.anonymous_identifier).filter(Boolean) as string[]);
  const sharesBySession = new Set(shareEvents.map((e) => e.session_id).filter(Boolean) as string[]);
  const sourcesBySession = new Map<string, number>();
  for (const e of sourceEvents) if (e.session_id) sourcesBySession.set(e.session_id, (sourcesBySession.get(e.session_id) ?? 0) + 1);
  const playsByVisitor = new Map<string, number>();
  for (const s of sessions) playsByVisitor.set(s.anonymous_identifier, (playsByVisitor.get(s.anonymous_identifier) ?? 0) + 1);

  const visitors = uniq([...events.map((e) => e.anonymous_identifier), ...sessions.map((s) => s.anonymous_identifier)]);
  const quizVisitors = uniq([...ofType("quiz_view").map((e) => e.anonymous_identifier), ...sessions.map((s) => s.anonymous_identifier)]);
  const completed = sessions.filter((s) => s.completed_at);

  const durations = completed
    .map((s) => (new Date(s.completed_at!).getTime() - new Date(s.started_at).getTime()) / 1000)
    .filter((d) => d > 0 && d < 3600);

  const pct = (v: number, base: number) => (base ? `${Math.round((100 * v) / base)}%` : "—");
  const funnel = [
    { label: "Visitantes", value: visitors, hint: "navegadores únicos que abriram o site" },
    { label: "Abriram o desafio", value: quizVisitors, hint: pct(quizVisitors, visitors) + " dos visitantes" },
    { label: "Começaram", value: sessions.length, hint: "partidas iniciadas" },
    { label: "Terminaram", value: completed.length, hint: pct(completed.length, sessions.length) + " de quem começou" },
    { label: "Viram os gráficos", value: numbersBySession.size, hint: pct(numbersBySession.size, completed.length) + " de quem terminou" },
    { label: "Abriram /banco", value: bancoByVisitor.size, hint: "visitantes únicos" },
    { label: "Clicaram numa fonte", value: uniq(sourceEvents.map((e) => e.anonymous_identifier)), hint: `${sourceEvents.length} cliques no total` },
  ];

  // série diária (últimos até 30 dias, sem buracos)
  const span = Math.min(days, 30);
  const daily: Analytics["daily"] = [];
  for (let i = span - 1; i >= 0; i--) {
    const iso = new Date(Date.now() - i * 86_400_000).toISOString();
    const key = dayKey(iso);
    daily.push({ day: key, label: `${key.slice(8, 10)}/${key.slice(5, 7)}`, visitors: 0, sessions: 0, numbers: 0 });
  }
  const dayIdx = new Map(daily.map((d, i) => [d.day, i]));
  const visitorsPerDay = new Map<string, Set<string>>();
  for (const e of events) {
    const k = dayKey(e.created_at);
    if (!visitorsPerDay.has(k)) visitorsPerDay.set(k, new Set());
    if (e.anonymous_identifier) visitorsPerDay.get(k)!.add(e.anonymous_identifier);
    if (e.type === "numbers_view" && dayIdx.has(k)) daily[dayIdx.get(k)!].numbers++;
  }
  for (const s of sessions) {
    const k = dayKey(s.started_at);
    if (dayIdx.has(k)) daily[dayIdx.get(k)!].sessions++;
    if (!visitorsPerDay.has(k)) visitorsPerDay.set(k, new Set());
    visitorsPerDay.get(k)!.add(s.anonymous_identifier);
  }
  for (const d of daily) d.visitors = visitorsPerDay.get(d.day)?.size ?? 0;

  const hourly = Array.from({ length: 24 }, () => 0);
  for (const s of sessions) hourly[hourOf(s.started_at)]++;

  const campaignMap = new Map<string, { sessions: number; completed: number; numbers: number }>();
  for (const s of sessions) {
    const k = s.campaign || "link direto";
    const c = campaignMap.get(k) ?? { sessions: 0, completed: 0, numbers: 0 };
    c.sessions++;
    if (s.completed_at) c.completed++;
    if (numbersBySession.has(s.id)) c.numbers++;
    campaignMap.set(k, c);
  }

  const sourceMap = new Map<string, { host: string; url: string; value: number }>();
  for (const e of sourceEvents) {
    const url = String(e.meta?.url ?? "");
    if (!url) continue;
    const cur = sourceMap.get(url) ?? { host: String(e.meta?.host ?? ""), url, value: 0 };
    cur.value++;
    sourceMap.set(url, cur);
  }

  const participants: Participant[] = sessions.map((s) => ({
    session: s,
    name: s.display_name,
    total: s.question_ids?.length ?? 0,
    completed: !!s.completed_at,
    sawNumbers: numbersBySession.has(s.id),
    openedBanco: bancoByVisitor.has(s.anonymous_identifier),
    sourceClicks: sourcesBySession.get(s.id) ?? 0,
    shared: sharesBySession.has(s.id),
    playsByVisitor: playsByVisitor.get(s.anonymous_identifier) ?? 1,
  }));

  return {
    days,
    funnel,
    totals: {
      visitors,
      sessions: sessions.length,
      completed: completed.length,
      numbersViews: numbersBySession.size,
      named: sessions.filter((s) => s.display_name).length,
      returning: [...playsByVisitor.values()].filter((n) => n > 1).length,
      avgSeconds: durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : null,
      sourceClicks: sourceEvents.length,
      shares: shareEvents.length,
    },
    daily,
    hourly,
    devices: countBy(sessions, (s) => s.device ?? "sem registro"),
    campaigns: [...campaignMap].map(([key, v]) => ({ key, ...v })).sort((a, b) => b.sessions - a.sessions),
    referrers: countBy(sessions, (s) => s.referrer ?? "direto / QR Code").slice(0, 8),
    topSources: [...sourceMap.values()].sort((a, b) => b.value - a.value).slice(0, 10),
    participants,
  };
}
