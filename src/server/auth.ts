import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Autenticação do administrador: uma senha (ADMIN_SECRET) troca por um cookie
 * httpOnly assinado com HMAC-SHA256 e com validade. Sem contas, sem e-mail.
 */
export const ADMIN_COOKIE = "gb_admin";
const TTL_SECONDS = 60 * 60 * 12; // 12h

export const DEV_FALLBACK_SECRET = "gabarito-dev";

export function adminSecret(): string | null {
  const s = process.env.ADMIN_SECRET;
  if (s && s.length >= 12) return s;
  if (process.env.NODE_ENV !== "production") return DEV_FALLBACK_SECRET;
  return null;
}

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function checkPassword(input: string): boolean {
  const secret = adminSecret();
  if (!secret) return false;
  // compara hashes para não vazar o tamanho da senha
  return safeEqual(sign(input, "pw"), sign(secret, "pw"));
}

export function issueToken(): { value: string; maxAge: number } {
  const secret = adminSecret();
  if (!secret) throw new Error("ADMIN_SECRET não configurado (mínimo 12 caracteres).");
  const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const payload = `admin.${exp}`;
  return { value: `${payload}.${sign(payload, secret)}`, maxAge: TTL_SECONDS };
}

export function verifyToken(token: string | undefined | null): boolean {
  const secret = adminSecret();
  if (!secret || !token) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "admin") return false;
  const exp = Number(parts[1]);
  if (!Number.isFinite(exp) || exp < Date.now() / 1000) return false;
  return safeEqual(parts[2], sign(`${parts[0]}.${parts[1]}`, secret));
}
