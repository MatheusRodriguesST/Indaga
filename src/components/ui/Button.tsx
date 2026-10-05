import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "sun" | "ink" | "paper" | "ghost" | "red";
type Size = "md" | "lg" | "xl";

const VARIANTS: Record<Variant, string> = {
  sun: "bg-sun text-ink border-ink shadow-hard hover:bg-sun-soft",
  ink: "bg-ink text-paper border-ink shadow-hard-sun hover:bg-black",
  paper: "bg-paper text-ink border-ink shadow-hard hover:bg-white",
  red: "bg-red text-paper border-ink shadow-hard hover:bg-flame",
  ghost: "bg-transparent text-current border-current shadow-none hover:bg-white/10",
};

const SIZES: Record<Size, string> = {
  md: "min-h-12 px-5 text-base",
  lg: "min-h-14 px-6 text-lg",
  xl: "min-h-16 px-7 text-xl sm:text-2xl",
};

function classes(variant: Variant, size: Size, block: boolean | undefined, className?: string) {
  return cn(
    "press inline-flex items-center justify-center gap-3 border-[3px] display-wide tracking-tight",
    "disabled:cursor-not-allowed disabled:opacity-60 select-none",
    VARIANTS[variant],
    SIZES[size],
    block && "w-full",
    className,
  );
}

interface Common {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  icon?: ReactNode;
}

export function Button({
  variant = "sun",
  size = "lg",
  block,
  icon,
  className,
  children,
  ...rest
}: Common & ComponentProps<"button">) {
  return (
    <button className={classes(variant, size, block, className)} {...rest}>
      <span>{children}</span>
      {icon}
    </button>
  );
}

export function ButtonLink({
  variant = "sun",
  size = "lg",
  block,
  icon,
  className,
  children,
  ...rest
}: Common & ComponentProps<typeof Link>) {
  return (
    <Link className={classes(variant, size, block, className)} {...rest}>
      <span>{children}</span>
      {icon}
    </Link>
  );
}
