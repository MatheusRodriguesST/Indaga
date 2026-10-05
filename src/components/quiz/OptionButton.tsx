"use client";

import { Check, LoaderCircle, X } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import type { PublicOption } from "@/types/domain";

export type OptionState = "idle" | "pending" | "correct" | "wrong" | "dimmed";

export function OptionButton({
  option,
  state,
  disabled,
  onSelect,
  index,
}: {
  option: PublicOption;
  state: OptionState;
  disabled: boolean;
  onSelect: () => void;
  index: number;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-disabled={disabled}
      aria-label={`Alternativa ${option.label}: ${option.text}${
        state === "correct" ? " — resposta correta" : state === "wrong" ? " — sua resposta, incorreta" : ""
      }`}
      initial={{ x: -24, opacity: 0 }}
      animate={
        state === "wrong"
          ? { x: [0, -8, 8, -5, 5, 0], opacity: 1 }
          : state === "correct"
            ? { x: 0, opacity: 1, scale: [1, 1.03, 1] }
            : { x: 0, opacity: 1 }
      }
      transition={{ duration: state === "wrong" ? 0.4 : 0.35, delay: state === "idle" ? 0.08 * index : 0 }}
      className={cn(
        "group relative grid w-full grid-cols-[auto_1fr_auto] items-stretch border-[3px] text-left",
        "min-h-[4.25rem] transition-[background-color,color,opacity,box-shadow,transform] duration-150",
        state === "idle" &&
          "border-ink bg-paper text-ink shadow-hard hover:-translate-y-0.5 hover:bg-white active:translate-x-1 active:translate-y-1 active:shadow-none",
        state === "pending" && "border-ink bg-sun-soft text-ink shadow-hard",
        state === "correct" && "z-10 border-ink bg-sun text-ink shadow-hard",
        state === "wrong" && "border-ink bg-ink text-paper/70 shadow-[6px_6px_0_0_var(--color-red)]",
        state === "dimmed" && "border-ink/40 bg-paper/50 text-ink/50 shadow-none",
        disabled && state === "idle" && "cursor-default",
      )}
    >
      <span
        className={cn(
          "display flex w-14 items-center justify-center border-r-[3px] text-3xl sm:w-16",
          state === "correct" ? "border-ink bg-ink text-sun" : state === "wrong" ? "border-ink bg-red text-paper" : "border-inherit bg-ink text-sun",
          state === "dimmed" && "bg-ink/40",
        )}
        aria-hidden
      >
        {state === "correct" ? <Check className="size-8" strokeWidth={4} /> : state === "wrong" ? <X className="size-8" strokeWidth={4} /> : option.label}
      </span>
      <span className="flex flex-col justify-center px-4 py-3">
        <span className={cn("display-wide text-lg leading-tight sm:text-xl", state === "wrong" && "line-through decoration-red decoration-[3px]")}>
          {option.text}
        </span>
        {(state === "correct" || state === "wrong") && (
          <span className="label mt-1 opacity-80">{state === "correct" ? "Resposta correta" : "Sua resposta"}</span>
        )}
      </span>
      <span className="flex items-center pr-4" aria-hidden>
        {state === "pending" && <LoaderCircle className="size-6 animate-spin" />}
      </span>
    </motion.button>
  );
}
