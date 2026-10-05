"use client";

import { useEffect } from "react";
import { rememberReferrer, track } from "@/lib/track";
import type { EventType } from "@/types/domain";

/** Registra a visita a uma página (montar uma vez por carregamento). */
export function Track({ type }: { type: EventType }) {
  useEffect(() => {
    rememberReferrer();
    track(type);
  }, [type]);
  return null;
}
