import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { STATUS_LABEL } from "@/lib/labels";
import type { EditorialStatus } from "@/types/domain";

export function PageTitle({ kicker, title, actions }: { kicker: string; title: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b-[3px] border-ink pb-4">
      <div>
        <p className="label text-red">{kicker}</p>
        <h1 className="display mt-1 text-6xl sm:text-7xl">{title}</h1>
      </div>
      {actions}
    </div>
  );
}

export function StatCard({ label, value, hint, accent }: { label: string; value: ReactNode; hint?: string; accent?: boolean }) {
  return (
    <div className={cn("border-[3px] border-ink p-4 shadow-hard-sm", accent ? "bg-sun" : "bg-white")}>
      <p className="label text-ink/70">{label}</p>
      <p className="display mt-2 text-6xl leading-none">{value}</p>
      {hint && <p className="mt-1 text-sm text-ink/60">{hint}</p>}
    </div>
  );
}

const STATUS_TONE: Record<EditorialStatus, "paper" | "warn" | "ink" | "neutral"> = {
  rascunho: "paper",
  em_revisao: "warn",
  publicada: "ink",
  arquivada: "neutral",
};

export function StatusBadge({ status }: { status: EditorialStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>;
}

export function Panel({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("border-[3px] border-ink bg-white", className)}>
      {title && <h2 className="label border-b-[3px] border-ink bg-paper-2 px-4 py-2.5">{title}</h2>}
      <div className="p-4">{children}</div>
    </section>
  );
}
