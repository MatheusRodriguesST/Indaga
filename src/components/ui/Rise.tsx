"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/** Entrada "de baixo pra cima" com leve atraso — para títulos de cartaz. */
export function Rise({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay, ease: [0.2, 0.9, 0.1, 1] }}
    >
      {children}
    </motion.div>
  );
}
