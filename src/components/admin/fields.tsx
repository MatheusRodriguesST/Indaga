"use client";

import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

const base =
  "w-full border-[3px] border-ink bg-white px-3 py-2.5 text-base text-ink placeholder:text-ink/35 focus:bg-sun-soft/40 focus:outline-none focus-visible:outline-ink";

export function Field({ label, hint, children, className }: { label: string; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <label className={cn("grid gap-1.5", className)}>
      <span className="label">{label}</span>
      {children}
      {hint && <span className="text-xs text-ink/60">{hint}</span>}
    </label>
  );
}

export function Input(props: ComponentProps<"input">) {
  return <input {...props} className={cn(base, "h-12", props.className)} />;
}

export function Textarea(props: ComponentProps<"textarea">) {
  return <textarea rows={3} {...props} className={cn(base, "leading-snug", props.className)} />;
}

export function Select(props: ComponentProps<"select">) {
  return <select {...props} className={cn(base, "h-12 appearance-auto", props.className)} />;
}

export function FormSection({ n, title, children, aside }: { n: string; title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="border-[3px] border-ink bg-white">
      <header className="flex items-center justify-between gap-3 border-b-[3px] border-ink bg-paper-2 px-4 py-2.5">
        <h2 className="flex items-center gap-3">
          <span className="display text-3xl text-red">{n}</span>
          <span className="display-wide text-lg">{title}</span>
        </h2>
        {aside}
      </header>
      <div className="grid gap-4 p-4">{children}</div>
    </section>
  );
}
