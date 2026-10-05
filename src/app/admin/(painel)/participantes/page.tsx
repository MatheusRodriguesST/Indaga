import { Download } from "lucide-react";
import Link from "next/link";
import { PeriodTabs } from "@/components/admin/charts";
import { PageTitle, StatCard } from "@/components/admin/ui";
import { cn } from "@/lib/cn";
import { formatDateTimeBR, getAnalytics, parsePeriod, type Participant } from "@/server/analytics";

export const dynamic = "force-dynamic";

const FILTERS = {
  todos: { label: "Todos", fn: () => true },
  nome: { label: "Com nome", fn: (p: Participant) => !!p.name },
  graficos: { label: "Viram os gráficos", fn: (p: Participant) => p.sawNumbers },
  voltaram: { label: "Voltaram", fn: (p: Participant) => p.playsByVisitor > 1 },
  incompletos: { label: "Não terminaram", fn: (p: Participant) => !p.completed },
} as const;
type FilterKey = keyof typeof FILTERS;

export default async function ParticipantesPage({ searchParams }: PageProps<"/admin/participantes">) {
  const sp = await searchParams;
  const period = parsePeriod(sp.p);
  const filter: FilterKey = typeof sp.f === "string" && sp.f in FILTERS ? (sp.f as FilterKey) : "todos";
  const a = await getAnalytics(period);
  const list = a.participants.filter(FILTERS[filter].fn);

  return (
    <>
      <PageTitle
        kicker="Quem jogou"
        title="Participantes"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <PeriodTabs current={period} base="/admin/participantes" />
            <a
              href={`/admin/participantes/csv?p=${period}`}
              className="label inline-flex items-center gap-1.5 border-2 border-ink bg-sun px-3 py-2 hover:bg-sun-soft"
            >
              <Download className="size-4" /> Baixar CSV
            </a>
          </div>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Partidas" value={a.participants.length} accent />
        <StatCard label="Com nome" value={a.totals.named} />
        <StatCard label="Voltaram" value={a.totals.returning} hint="jogaram 2+ vezes" />
        <StatCard label="Viram os gráficos" value={a.totals.numbersViews} />
      </div>

      <nav className="mb-4 flex flex-wrap gap-2" aria-label="Filtro">
        {(Object.keys(FILTERS) as FilterKey[]).map((k) => (
          <Link
            key={k}
            href={`/admin/participantes?p=${period}&f=${k}`}
            aria-current={filter === k ? "page" : undefined}
            className={cn("label border-2 border-ink px-3 py-2", filter === k ? "bg-ink text-sun" : "bg-white hover:bg-sun-soft")}
          >
            {FILTERS[k].label} ({a.participants.filter(FILTERS[k].fn).length})
          </Link>
        ))}
      </nav>

      {list.length === 0 ? (
        <p className="border-[3px] border-dashed border-ink/40 p-10 text-center text-ink/60">Ninguém aqui ainda.</p>
      ) : (
        <div className="overflow-x-auto border-[3px] border-ink bg-white">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-ink text-left text-paper">
              <tr className="font-mono text-[0.65rem] uppercase tracking-wider">
                <th className="px-3 py-2">Nome</th>
                <th className="px-3 py-2">Quando</th>
                <th className="px-3 py-2">Placar</th>
                <th className="px-3 py-2">Gráficos</th>
                <th className="px-3 py-2">/banco</th>
                <th className="px-3 py-2">Fontes</th>
                <th className="px-3 py-2">Vezes</th>
                <th className="px-3 py-2">Campanha</th>
                <th className="px-3 py-2">Aparelho</th>
                <th className="px-3 py-2">Origem</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.session.id} className="border-t border-ink/10 hover:bg-sun-soft/40">
                  <td className="px-3 py-2 font-bold">{p.name ?? <span className="font-normal text-ink/45">Anônimo</span>}</td>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{formatDateTimeBR(p.session.started_at)}</td>
                  <td className="px-3 py-2 font-mono text-xs">{p.completed ? `${p.session.score}/${p.total}` : <span className="text-red">parou</span>}</td>
                  <td className="px-3 py-2">{p.sawNumbers ? <Yes /> : <No />}</td>
                  <td className="px-3 py-2">{p.openedBanco ? <Yes /> : <No />}</td>
                  <td className="px-3 py-2 font-mono text-xs">{p.sourceClicks || "—"}</td>
                  <td className="px-3 py-2 font-mono text-xs">{p.playsByVisitor > 1 ? <span className="bg-sun px-1">{p.playsByVisitor}x</span> : "1"}</td>
                  <td className="px-3 py-2 font-mono text-xs">{p.session.campaign ?? "—"}</td>
                  <td className="px-3 py-2 text-xs capitalize">{p.session.device ?? "—"}</td>
                  <td className="px-3 py-2 text-xs">{p.session.referrer ?? "direto/QR"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-4 text-xs text-ink/55">
        &quot;Vezes&quot; conta partidas do mesmo navegador. Nome é opcional e digitado pela própria pessoa — o aviso na tela
        de entrada informa que os organizadores podem vê-lo.
      </p>
    </>
  );
}

function Yes() {
  return <span className="label bg-gov-lula px-1.5 py-0.5 text-paper">sim</span>;
}
function No() {
  return <span className="text-ink/35">—</span>;
}
