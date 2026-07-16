import Link from "next/link";
import type { ResortSummary } from "@ski/shared";
import { weatherEmoji } from "../lib/weather-icon";

export function ResortCard({ resort }: { resort: ResortSummary }) {
  const w = resort.weatherNow;
  return (
    <Link
      href={`/resorts/${resort.slug}`}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold group-hover:text-sky-600 dark:group-hover:text-sky-400">
            {resort.name}
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {resort.province} · {resort.city}
          </p>
        </div>
        {w ? (
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-sm dark:bg-sky-950">
            <span aria-hidden>{weatherEmoji(w.conditionText)}</span>
            <span className="font-medium">{w.tempC !== null ? `${Math.round(w.tempC)}°C` : "--"}</span>
          </div>
        ) : (
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-400 dark:bg-slate-800 dark:text-slate-500">
            暂无天气
          </span>
        )}
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-lg bg-slate-50 py-2 dark:bg-slate-800/60">
          <dt className="text-slate-500 dark:text-slate-400">海拔</dt>
          <dd className="mt-0.5 font-medium">
            {resort.altitudeTopM ? `${resort.altitudeTopM}m` : "--"}
          </dd>
        </div>
        <div className="rounded-lg bg-slate-50 py-2 dark:bg-slate-800/60">
          <dt className="text-slate-500 dark:text-slate-400">雪道</dt>
          <dd className="mt-0.5 font-medium">
            {resort.totalTrailKm ? `${resort.totalTrailKm}km` : "--"}
          </dd>
        </div>
        <div className="rounded-lg bg-slate-50 py-2 dark:bg-slate-800/60">
          <dt className="text-slate-500 dark:text-slate-400">雪季</dt>
          <dd className="mt-0.5 font-medium">
            {resort.seasonOpen && resort.seasonClose
              ? `${resort.seasonOpen.replace("-", ".")}~${resort.seasonClose.replace("-", ".")}`
              : "--"}
          </dd>
        </div>
      </dl>
    </Link>
  );
}
