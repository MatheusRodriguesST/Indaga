import { QrBuilder } from "@/components/admin/QrBuilder";
import { PageTitle } from "@/components/admin/ui";

export default function QrPage() {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return (
    <>
      <PageTitle kicker="Distribuição" title="QR Code" />
      <p className="mb-6 max-w-2xl text-ink/75">
        Gere o QR Code que leva direto ao desafio. Use uma campanha (ex.: <code className="font-mono">sala-3b</code>) para
        saber, nas estatísticas, de onde vieram os acessos. Configure <code className="font-mono">NEXT_PUBLIC_APP_URL</code>{" "}
        com o domínio final antes de imprimir.
      </p>
      <QrBuilder base={base} />
    </>
  );
}
