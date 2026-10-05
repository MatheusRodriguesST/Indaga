"use client";

import { QUIZ_CONFIG } from "@/config/brand";

/**
 * Pequenas conveniências por navegador. Tudo em try/catch: em aba anônima
 * ou com armazenamento bloqueado, o quiz continua funcionando.
 */
const RECENT_KEY = "gb_recent";
const NAME_KEY = "gb_name";
const SESSION_KEY = "gb_session";

function read(storage: () => Storage, key: string): string | null {
  try {
    return storage().getItem(key);
  } catch {
    return null;
  }
}
function write(storage: () => Storage, key: string, value: string | null) {
  try {
    if (value === null) storage().removeItem(key);
    else storage().setItem(key, value);
  } catch {
    /* ignorado */
  }
}
const local = () => window.localStorage;
const session = () => window.sessionStorage;

/** IDs das perguntas vistas recentemente, do mais novo para o mais antigo. */
export function getRecent(): string[] {
  try {
    const v = JSON.parse(read(local, RECENT_KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}
export function pushRecent(ids: string[]) {
  const merged = [...ids, ...getRecent().filter((id) => !ids.includes(id))].slice(0, QUIZ_CONFIG.recentMemory);
  write(local, RECENT_KEY, JSON.stringify(merged));
}

export const savedName = {
  get: () => read(local, NAME_KEY),
  set: (v: string | null) => write(local, NAME_KEY, v),
};

export const activeSession = {
  get: () => read(session, SESSION_KEY),
  set: (v: string | null) => write(session, SESSION_KEY, v),
};
