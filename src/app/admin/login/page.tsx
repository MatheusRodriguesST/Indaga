"use client";

import { LockKeyhole } from "lucide-react";
import { useActionState } from "react";
import { LogoMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { login } from "../actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <main className="grain flex min-h-dvh items-center justify-center bg-blood px-5">
      <div aria-hidden className="stripes pointer-events-none absolute inset-y-0 right-0 w-24 text-red/50" />
      <form action={action} className="on-paper relative z-10 w-full max-w-sm border-[3px] border-ink bg-paper p-6 text-ink shadow-[10px_10px_0_0_var(--color-ink)]">
        <div className="flex items-center gap-3">
          <LogoMark />
          <div>
            <p className="label text-red">Redação</p>
            <h1 className="display text-4xl">Acesso restrito</h1>
          </div>
        </div>
        <label htmlFor="password" className="label mt-8 block">
          Senha do administrador
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          autoFocus
          className="mt-2 h-14 w-full border-[3px] border-ink bg-white px-4 font-mono text-lg focus:outline-none focus-visible:outline-ink"
        />
        {state?.error && (
          <p role="alert" className="label mt-3 text-red">
            {state.error}
          </p>
        )}
        <Button type="submit" block size="lg" className="mt-6" disabled={pending} icon={<LockKeyhole className="size-5" strokeWidth={2.5} />}>
          {pending ? "Entrando…" : "Entrar"}
        </Button>
        {process.env.NODE_ENV !== "production" && (
          <p className="mt-5 text-xs text-ink/60">
            Dev: sem <code>ADMIN_SECRET</code> no <code>.env.local</code>, a senha é <code>gabarito-dev</code>.
          </p>
        )}
      </form>
    </main>
  );
}
