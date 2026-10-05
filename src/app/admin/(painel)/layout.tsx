import { LogOut } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";
import { AdminNav } from "@/components/admin/AdminNav";
import { repo } from "@/server/repo";
import { logout } from "../actions";

export const metadata: Metadata = {
  title: "Redação",
  robots: { index: false, follow: false },
};

export default function PainelLayout({ children }: LayoutProps<"/admin">) {
  const mode = repo().kind;
  return (
    <div className="on-paper min-h-dvh bg-paper text-ink">
      <header className="sticky top-0 z-30 border-b-[3px] border-ink bg-ink text-paper">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3">
          <Link href="/admin" className="flex items-center gap-2.5">
            <LogoMark className="size-8" />
            <span className="display text-2xl">Redação</span>
          </Link>
          <AdminNav />
          <form action={logout} className="ml-auto">
            <button className="label inline-flex items-center gap-1.5 px-2 py-2 text-paper/70 hover:text-sun" aria-label="Sair">
              <LogOut className="size-4" /> <span className="hidden sm:inline">Sair</span>
            </button>
          </form>
        </div>
      </header>
      {mode === "memory" && (
        <p className="label border-b-2 border-ink bg-sun px-5 py-2 text-center">
          Modo demonstração: sem Supabase configurado, as alterações ficam só na memória do servidor.
        </p>
      )}
      <main className="mx-auto max-w-6xl px-5 pb-24 pt-8">{children}</main>
    </div>
  );
}
