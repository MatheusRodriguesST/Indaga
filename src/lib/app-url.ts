/**
 * URL pública do site. Ordem: NEXT_PUBLIC_APP_URL (domínio próprio) →
 * domínio de produção da Vercel → URL do deploy na Vercel → localhost.
 * Assim o domínio aleatório "xxx.vercel.app" funciona sem configurar nada.
 */
export function appUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}
