import { Bus, Car, Plane, TrainFront, type LucideIcon } from "lucide-react";
import type { TransportItem } from "@ski/shared";

const MODE_ICON: Record<TransportItem["mode"], LucideIcon> = {
  train: TrainFront,
  plane: Plane,
  car: Car,
  bus: Bus,
};
const MODE_COLOR: Record<TransportItem["mode"], string> = {
  train: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
  plane: "bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400",
  car: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  bus: "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
};

export function TransportCards({ items }: { items: TransportItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((t, i) => {
        const Icon = MODE_ICON[t.mode] ?? Car;
        return (
          <div
            key={i}
            className="rounded-2xl border border-slate-100 p-5 transition hover:border-slate-200 dark:border-slate-800/80"
          >
            <div className="flex items-center gap-2.5">
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${MODE_COLOR[t.mode] ?? ""}`}>
                <Icon size={18} strokeWidth={2} />
              </span>
              <h3 className="text-sm font-semibold tracking-tight">{t.title}</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-300">{t.detail}</p>
          </div>
        );
      })}
    </div>
  );
}
