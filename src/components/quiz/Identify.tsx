"use client";

import { ArrowRight, UserRound } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function Identify({
  initialName,
  busy,
  onStart,
}: {
  initialName: string;
  busy: boolean;
  onStart: (name: string | null) => void;
}) {
  const [mode, setMode] = useState<"choose" | "name">(initialName ? "name" : "choose");
  const [name, setName] = useState(initialName);

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.2, 0.9, 0.1, 1] }}
      className="mx-auto w-full max-w-xl"
    >
      <p className="label text-sun">Antes de começar</p>
      <h1 className="display mt-3 text-[clamp(4rem,17vw,7.5rem)]">
        Como devemos
        <br />
        <span className="text-sun">chamar você?</span>
      </h1>

      <div className="mt-10 grid gap-4">
        {mode === "choose" ? (
          <>
            <Button size="xl" block onClick={() => onStart(null)} disabled={busy} icon={<ArrowRight className="size-7" strokeWidth={3} />}>
              Continuar anonimamente
            </Button>
            <Button size="lg" variant="paper" block onClick={() => setMode("name")} disabled={busy} icon={<UserRound className="size-6" strokeWidth={2.5} />}>
              Digitar meu nome
            </Button>
          </>
        ) : (
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              onStart(name.trim() || null);
            }}
          >
            <label htmlFor="display-name" className="label text-paper/80">
              Seu nome ou apelido (opcional)
            </label>
            <input
              id="display-name"
              autoFocus
              maxLength={40}
              autoComplete="nickname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Arthur"
              className="display-wide h-16 w-full border-[3px] border-ink bg-paper px-4 text-2xl text-ink shadow-hard placeholder:text-ink/30 focus:bg-white focus:outline-none focus-visible:outline-sun"
            />
            <Button type="submit" size="xl" block disabled={busy} icon={<ArrowRight className="size-7" strokeWidth={3} />}>
              {busy ? "Sorteando…" : "Começar"}
            </Button>
            <button type="button" onClick={() => onStart(null)} disabled={busy} className="label py-2 text-paper/70 underline decoration-2 underline-offset-4 hover:text-sun">
              Prefiro continuar anônimo
            </button>
          </form>
        )}
      </div>

      <p className="mt-8 max-w-md text-sm leading-relaxed text-paper/65">
        Não pedimos e-mail, CPF, telefone nem senha. Se você digitar um nome, ele fica salvo junto com a sua partida apenas
        para aparecer no seu resultado. Nada é compartilhado e ninguém é classificado politicamente.
      </p>
    </motion.div>
  );
}
