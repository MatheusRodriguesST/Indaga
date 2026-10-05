import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "ink" | "sun" | "red" | "paper" | "outline" | "warn" | "neutral" | "solid";

const TONES: Record<Tone, string> = {
  ink: "bg-ink text-sun border-ink",
  sun: "bg-sun text-ink border-ink",
  red: "bg-red text-paper border-red",
  paper: "bg-paper text-ink border-ink",
  outline: "bg-transparent text-current border-current",
  solid: "bg-ink text-paper border-ink",
  warn: "bg-sun-soft text-ink border-ink border-dashed",
  neutral: "bg-paper-2 text-ink border-ink/40",
};

export function Badge({ tone = "ink", className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return (
    <span className={cn("label inline-flex items-center gap-1.5 border-2 px-2 py-1 leading-none", TONES[tone], className)}>
      {children}
    </span>
  );
}
