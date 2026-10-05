"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Carimbo que "bate" no papel. */
export function Stamp({
  children,
  tone = "red",
  rotate = -8,
  className,
}: {
  children: ReactNode;
  tone?: "red" | "ink";
  rotate?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ scale: 2.4, opacity: 0, rotate: rotate - 10 }}
      animate={{ scale: 1, opacity: 1, rotate }}
      transition={{ type: "spring", stiffness: 520, damping: 22, mass: 0.7 }}
      className={cn(
        "display-wide inline-block border-[5px] px-4 pb-1 pt-2 text-[2.6rem] leading-none mix-blend-multiply",
        tone === "red" ? "border-red text-red" : "border-ink text-ink",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
