import type { DailyForecast } from "@ski/shared";
import { weatherEmoji } from "../lib/weather-icon";

function dayLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86_400_000);
  if (diff === 0) return "今天";
  if (diff === 1) return "明天";
  return `周${"日一二三四五六"[d.getDay()]}`;
}

export function ForecastStrip({ daily }: { daily: DailyForecast[] }) {
  if (daily.length === 0) {
    return (
      <p className="rounded-xl bg-slate-100 py-8 text-center text-sm text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
        暂无预报数据（天气采集接入后自动展示）
      </p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max gap-2">
        {daily.map((d) => (
          <div
            key={d.forecastDate}
            className="flex w-24 shrink-0 flex-col items-center rounded-xl border border-slate-200 bg-white px-2 py-3 text-center dark:border-slate-800 dark:bg-slate-900"
          >
            <span className="text-xs text-slate-500 dark:text-slate-400">{dayLabel(d.forecastDate)}</span>
            <span className="text-[10px] text-slate-400">{d.forecastDate.slice(5).replace("-", "/")}</span>
            <span className="my-1.5 text-2xl" aria-hidden>
              {weatherEmoji(d.conditionDay)}
            </span>
            <span className="text-xs">{d.conditionDay ?? "--"}</span>
            <span className="mt-1 text-xs font-medium">
              {d.tempMinC ?? "--"}° / {d.tempMaxC ?? "--"}°
            </span>
            {d.snowfallMm !== null && d.snowfallMm > 0 && (
              <span className="mt-1 rounded-full bg-sky-50 px-1.5 py-0.5 text-[10px] text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                降雪 {d.snowfallMm}mm
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
