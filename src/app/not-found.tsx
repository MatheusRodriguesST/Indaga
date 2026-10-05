import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="grain flex min-h-dvh flex-col items-start justify-center gap-6 bg-blood px-6">
      <p className="label text-sun">Erro 404</p>
      <h1 className="display text-[clamp(5rem,22vw,12rem)]">
        Fonte
        <br />
        <span className="text-sun">não encontrada.</span>
      </h1>
      <ButtonLink href="/">Voltar ao início</ButtonLink>
    </main>
  );
}
