"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { deleteQuestion } from "@/app/admin/actions";

export function DeleteQuestionButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm("Excluir esta pergunta definitivamente? Prefira ARQUIVAR para manter o histórico.")) {
          start(() => deleteQuestion(id));
        }
      }}
      className="label inline-flex items-center justify-center gap-2 border-[3px] border-red px-3 py-3 text-red hover:bg-red hover:text-paper"
    >
      <Trash2 className="size-4" /> {pending ? "Excluindo…" : "Excluir pergunta"}
    </button>
  );
}
