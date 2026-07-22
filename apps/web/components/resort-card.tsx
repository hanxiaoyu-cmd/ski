import Link from "next/link";
import { CalendarRange, MapPin, Mountain, Route } from "lucide-react";
import type { ResortSummary } from "@ski/shared";
import { ResortCover } from "./resort-cover";
import { WeatherGlyph } from "./weather-glyph";

export function ResortCard({ resort }: { resort: ResortSummary }) {
  const w = resort.weatherNow;
  return (
    <Link
      href={`/resorts/${resort.slug}`}
      className="group overflow-hidden rounded-2xl border border-slate-100 bg-white transition duration-200 hover:-translate-y-1 hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/60 dark:border-slate-800/80 dark:bg-slate-900 dark:hover:shadow-black/30"
    >
      <div className="relative h-36 w-full overflow-hidden">
        <ResortCover
          slug={resort.slug}
          name={resort.name}
          imageUrl={resort.coverImageUrl}
          className="transition duration-500 group-hover:scale-105"
        />
        {w && (
          <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-sm font-medium backdrop-blur dark:bg-slate-900/80">
            <WeatherGlyph text={w.conditionText} size={16} />
            {w.tempC !== null ? `${Math.round(w.tempC)}°` : "--"}
          </span>
        )}
        {resort.isIndoor && (
          <span className="absolute left-3 top-3 rounded-full bg-indigo-600/95 px-2.5 py-1 text-xs font-medium text-white">
            室内雪场
          </span>
        )}
      </div>

      <div className="p-5">
        <h2 className="text-base font-semibold tracking-tight group-hover:text-sky-600 dark:group-hover:text-sky-400">
          {resort.name}
        </h2>
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
          <MapPin size={12} strokeWidth={2} />
          {resort.province} · {resort.city}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
          {resort.isIndoor ? (
            <>
              <span className="flex items-center gap-1">
                <Mountain size={13} className="text-slate-400" />
                室内恒温
              </span>
              {resort.totalTrailKm && (
                <span className="flex items-center gap-1">
                  <Route size={13} className="text-slate-400" />
                  {resort.totalTrailKm}km 雪道
                </span>
              )}
              <span className="flex items-center gap-1">
                <CalendarRange size={13} className="text-slate-400" />
                全年开放
              </span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1">
                <Mountain size={13} className="text-slate-400" />
                {resort.altitudeTopM ? `${resort.altitudeTopM}m` : "--"}
              </span>
              <span className="flex items-center gap-1">
                <Route size={13} className="text-slate-400" />
                {resort.totalTrailKm ? `${resort.totalTrailKm}km 雪道` : "--"}
              </span>
              <span className="flex items-center gap-1">
                <CalendarRange size={13} className="text-slate-400" />
                {resort.seasonOpen && resort.seasonClose
                  ? `${resort.seasonOpen.replace("-", ".")} ~ ${resort.seasonClose.replace("-", ".")}`
                  : "--"}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
