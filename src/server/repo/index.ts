import "server-only";
import { memoryRepo } from "./memory";
import { createSupabaseRepo } from "./supabase";
import type { Repo } from "./types";

let cached: Repo | null = null;

/**
 * Usa o Supabase quando SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY existem.
 * Sem elas, cai no modo demonstração (memória) — útil para ver o design
 * antes de criar o banco. Em produção, defina as variáveis.
 */
export function repo(): Repo {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    cached = createSupabaseRepo(url, key);
  } else {
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_MEMORY_MODE !== "true") {
      throw new Error(
        "SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY não configuradas. Defina-as (ou ALLOW_MEMORY_MODE=true para demonstração).",
      );
    }
    cached = memoryRepo;
  }
  return cached;
}

export type { Repo } from "./types";
