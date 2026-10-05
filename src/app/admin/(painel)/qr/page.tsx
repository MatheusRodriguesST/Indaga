import { appUrl } from "@/lib/app-url";
import { QrBuilder } from "@/components/admin/QrBuilder";
import { PageTitle } from "@/components/admin/ui";

export default function QrPage() {
  const base = appUrl();
  return (
    <>
      <PageTitle kicker="Distribuição" title="QR Code" />
      <p className="mb-6 max-w-2xl text-ink/75">
        Gere o QR Code que leva direto ao desafio. Use uma campanha (ex.: <code className="font-mono">sala-3b</code>) para
        saber, nas estatísticas, de onde vieram os acessos. O link usa o endereço por onde você abriu este painel.
      </p>
      <QrBuilder base={base} />
    </>
  );
}
