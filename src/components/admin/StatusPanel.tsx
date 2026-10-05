"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { changeStatus } from "@/app/admin/actions";
import { cn } from "@/lib/cn";
import { STATUS_LABEL } from "@/lib/labels";
import type { EditorialStatus } from "@/types/domain";
import { Textarea } from "./fields";

const FLOW: EditorialStatus[] = ["rascunho", "em_revisao", "publicada"];

const NEXT: Record<EditorialStatus, { to: EditorialStatus; label: string }[]> = {
  rascunho: [
    { to: "em_revisao", label: "Enviar para revisão" },
    { to: "arquivada", label: "Arquivar" },
  ],
  em_revisao: [
    { to: "publicada", label: "Aprovar e publicar" },
    { to: "rascunho", label: "Devolver para rascunho" },
    { to: "arquivada", label: "Arquivar" },
  ],
  publicada: [
    { to: "em_revisao", label: "Despublicar (voltar à revisão)" },
    { to: "arquivada", label: "Arquivar" },
  ],
  arquivada: [{ to: "rascunho", label: "Reabrir como rascunho" }],
};

const CHECKS = [
  ["data", "Data verificada"],
  ["governo", "Governo/período verificado"],
  ["acontecimento", "Acontecimento verificado"],
  ["fonte", "Fontes abertas e conferidas"],
  ["legislacao", "Legislação conferida (ou não se aplica)"],
  ["situacao", "Situação jurídica conferida"],
] as const;

export function StatusPanel({ id, status }: { id: string; status: EditorialStatus }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [checks, setChecks] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  function go(to: EditorialStatus) {
    setErrors([]);
    start(async () => {
      const res = await changeStatus({ id, to, note, checklist: checks });
      if (!res.ok) setErrors(res.errors ?? ["Erro."]);
      else {
        setNote("");
        setChecks([]);
        router.refresh();
      }
    });
  }

  const canPublish = status === "em_revisao";

  return (
    <div className="grid gap-4">
      <ol className="grid grid-cols-3 gap-1" aria-label="Fluxo editorial">
        {FLOW.map((s, i) => {
          const reached = status !== "arquivada" && FLOW.indexOf(status) >= i;
          return (
            <li key={s} className={cn("label border-2 border-ink px-2 py-2 text-center", reached ? "bg-ink text-sun" : "bg-white text-ink/50")}>
              {STATUS_LABEL[s]}
            </li>
          );
        })}
      </ol>
      {status === "arquivada" && <p className="label bg-paper-2 px-2 py-2 text-center">Arquivada</p>}

      {canPublish && (
        <fieldset className="grid gap-2 border-2 border-dashed border-ink p-3">
          <legend className="label px-1">Verificação das fontes</legend>
          {CHECKS.map(([k, label]) => (
            <label key={k} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 accent-red"
                checked={checks.includes(k)}
                onChange={(e) => setChecks((c) => (e.target.checked ? [...c, k] : c.filter((x) => x !== k)))}
              />
              {label}
            </label>
          ))}
        </fieldset>
      )}

      <Textarea rows={2} placeholder="Nota da revisão (opcional)" value={note} onChange={(e) => setNote(e.target.value)} />

      <div className="grid gap-2">
        {NEXT[status].map((n) => (
          <button
            key={n.to}
            type="button"
            disabled={pending || (n.to === "publicada" && checks.length < CHECKS.length)}
            onClick={() => go(n.to)}
            className={cn(
              "press display-wide border-[3px] border-ink px-3 py-2.5 text-left text-base shadow-hard-sm disabled:cursor-not-allowed disabled:opacity-50",
              n.to === "publicada" ? "bg-sun" : n.to === "arquivada" ? "bg-white text-red" : "bg-white",
            )}
          >
            {n.label}
          </button>
        ))}
      </div>

      {errors.length > 0 && (
        <ul role="alert" className="grid gap-1 border-[3px] border-ink bg-red p-3 text-sm text-paper">
          {errors.map((e, i) => (
            <li key={i}>• {e}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
