"use client";

import { useActionState } from "react";
import { createCategory } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "./fields";

export function CategoryForm() {
  const [state, action, pending] = useActionState(createCategory, null);
  return (
    <form action={action} className="grid gap-3">
      <Field label="Nome">
        <Input name="name" required maxLength={60} placeholder="Ex.: Educação" />
      </Field>
      <div className="grid grid-cols-[90px_1fr] gap-3">
        <Field label="Emoji">
          <Input name="emoji" required maxLength={8} defaultValue="📌" className="text-center text-xl" />
        </Field>
        <Field label="Slug">
          <Input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="educacao" className="font-mono" />
        </Field>
      </div>
      {state?.error && <p className="label text-red">{state.error}</p>}
      {state?.ok && <p className="label text-ink">Categoria criada.</p>}
      <Button type="submit" size="md" disabled={pending}>
        {pending ? "Criando…" : "Criar categoria"}
      </Button>
    </form>
  );
}
