import "server-only";

/** Classificação grosseira do aparelho a partir do User-Agent (não guardamos o UA). */
export function deviceFromUA(ua: string | null): "celular" | "tablet" | "computador" {
  const s = (ua ?? "").toLowerCase();
  if (/ipad|tablet|(android(?!.*mobile))/.test(s)) return "tablet";
  if (/mobi|iphone|android/.test(s)) return "celular";
  return "computador";
}

/** Só o domínio de origem (ex.: "instagram.com"); ignora o próprio site. */
export function referrerHost(ref: string | null | undefined, ownHost: string | null): string | null {
  if (!ref) return null;
  try {
    const host = new URL(ref).hostname.replace(/^www\./, "").replace(/^l\.|^lm\./, "");
    if (!host || host === ownHost?.split(":")[0]) return null;
    return host.slice(0, 80);
  } catch {
    return null;
  }
}
