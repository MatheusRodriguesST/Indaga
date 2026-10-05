"use client";

import { useEffect } from "react";
import { rememberReferrer, track } from "@/lib/track";

/**
 * Um único ouvinte para o site todo: registra cliques em links externos
 * (as fontes — Planalto, Poder360, Banco Central…).
 */
export function LinkTracker() {
  useEffect(() => {
    rememberReferrer();
    if (window.location.pathname.startsWith("/admin")) return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      let url: URL;
      try {
        url = new URL(a.href);
      } catch {
        return;
      }
      if (url.origin === window.location.origin || !/^https?:$/.test(url.protocol)) return;
      track("source_click", { url: a.href.slice(0, 300), host: url.hostname.replace(/^www\./, "") });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
