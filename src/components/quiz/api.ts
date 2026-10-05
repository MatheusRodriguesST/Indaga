"use client";

import type { Reveal, SessionState } from "@/types/domain";

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Algo deu errado. Tente de novo.");
  return data as T;
}

export const quizApi = {
  start: (body: { displayName: string | null; campaign: string | null; recent: string[]; referrer: string | null }) =>
    call<SessionState>("/api/sessions", { method: "POST", body: JSON.stringify(body) }),
  state: (id: string) => call<SessionState>(`/api/sessions/${id}`),
  answer: (id: string, questionId: string, optionId: string) =>
    call<{ reveal: Reveal; completed: boolean; score: number | null }>(`/api/sessions/${id}/answer`, {
      method: "POST",
      body: JSON.stringify({ questionId, optionId }),
    }),
};
