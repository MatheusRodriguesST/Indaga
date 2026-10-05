"use client";

import { activeSession } from "@/lib/client-storage";
import type { EventType } from "@/types/domain";

type Meta = Record<string, string | number | boolean | null>;

const REF_KEY = "gb_ref";

/** Guarda de onde a pessoa veio na PRIMEIRA página da visita (ex.: instagram.com). */
export function rememberReferrer() {
  try {
    if (window.sessionStorage.getItem(REF_KEY) === null) window.sessionStorage.setItem(REF_KEY, document.referrer || "");
  } catch {
    /* ignorado */
  }
}

export function firstReferrer(): string | null {
  try {
    return window.sessionStorage.getItem(REF_KEY) || null;
  } catch {
    return null;
  }
}

function campaignFromPath(path: string): string | null {
  const m = /^\/desafio\/([a-z0-9-]{1,40})/i.exec(path);
  return m ? m[1].toLowerCase() : null;
}

/**
 * Envia um evento de uso. Nunca quebra a página: falhas são ignoradas.
 * `keepalive` garante o envio mesmo se a pessoa estiver saindo da página.
 */
export function track(type: EventType, meta?: Meta, opts?: { campaign?: string | null }) {
  try {
    const path = window.location.pathname;
    void fetch("/api/events", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        sessionId: activeSession.get(),
        path: path.slice(0, 200),
        campaign: opts?.campaign ?? campaignFromPath(path),
        meta,
      }),
    }).catch(() => {});
  } catch {
    /* ignorado */
  }
}

/** Dispara no máximo uma vez por aba (ex.: "viu os gráficos" desta partida). */
export function trackOnce(key: string, type: EventType, meta?: Meta) {
  try {
    const k = `gb_once_${key}`;
    if (window.sessionStorage.getItem(k)) return;
    window.sessionStorage.setItem(k, "1");
  } catch {
    /* sem storage: envia mesmo assim */
  }
  track(type, meta);
}
