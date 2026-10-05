"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/admin", label: "Painel" },
  { href: "/admin/participantes", label: "Participantes" },
  { href: "/admin/perguntas", label: "Perguntas" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/qr", label: "QR Code" },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="-mx-1 flex overflow-x-auto" aria-label="Administração">
      {LINKS.map((l) => {
        const active = l.href === "/admin" ? path === "/admin" : path.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={cn("label whitespace-nowrap px-2.5 py-2", active ? "bg-sun text-ink" : "text-paper/75 hover:text-sun")}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
