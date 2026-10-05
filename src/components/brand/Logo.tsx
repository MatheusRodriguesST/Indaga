import Link from "next/link";
import { BRAND } from "@/config/brand";
import { cn } from "@/lib/cn";

/** Marca: "cartão de gabarito" — bolha marcada + wordmark condensado. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden className={cn("size-9 shrink-0", className)}>
      <rect x="1" y="1" width="38" height="38" fill="var(--color-sun)" stroke="var(--color-ink)" strokeWidth="2" />
      <circle cx="12" cy="13" r="4.5" fill="none" stroke="var(--color-ink)" strokeWidth="2" />
      <circle cx="28" cy="13" r="4.5" fill="var(--color-ink)" />
      <circle cx="12" cy="28" r="4.5" fill="none" stroke="var(--color-ink)" strokeWidth="2" />
      <circle cx="28" cy="28" r="4.5" fill="none" stroke="var(--color-ink)" strokeWidth="2" />
      <path d="M2 38 L38 2" stroke="var(--color-red)" strokeWidth="3" />
    </svg>
  );
}

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2.5", className)} aria-label={`${BRAND.name} — início`}>
      <LogoMark className="transition-transform duration-200 group-hover:-rotate-6" />
      <span className="display text-[2rem] leading-none tracking-tight">{BRAND.name}</span>
    </Link>
  );
}
