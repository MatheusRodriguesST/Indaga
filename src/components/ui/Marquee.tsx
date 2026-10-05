import { cn } from "@/lib/cn";

/** Faixa diagonal com texto correndo — "fita" de cartaz. */
export function Marquee({
  items,
  className,
  tilt = -3,
}: {
  items: string[];
  className?: string;
  tilt?: number;
}) {
  const row = [...items, ...items, ...items];
  return (
    <div
      className={cn("relative -mx-6 overflow-hidden border-y-[3px] border-ink bg-sun py-2.5 text-ink", className)}
      style={{ transform: `rotate(${tilt}deg)` }}
      aria-hidden
    >
      <div className="flex w-max animate-marquee">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0">
            {row.map((t, i) => (
              <span key={`${k}-${i}`} className="display flex items-center whitespace-nowrap px-4 text-2xl">
                {t}
                <span className="ml-8 inline-block size-3 rotate-45 bg-red" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
