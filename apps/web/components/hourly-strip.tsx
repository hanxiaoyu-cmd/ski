import type { HourlyForecast } from "@ski/shared";
import { weatherEmoji } from "../lib/weather-icon";

export function HourlyStrip({ hourly }: { hourly: HourlyForecast[] }) {
  if (hourly.length === 0) {
    return (
      <p className="rounded-xl bg-slate-100 py-6 text-center text-sm text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
        暂无逐小时数据（采集任务运行后自动展示）
      </p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex min-w-max gap-1">
        {hourly.map((h) => {
          const t = new Date(h.forecastTime);
          return (
            <div key={h.forecastTime} className="flex w-14 shrink-0 flex-col items-center gap-1 py-1 text-center">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {String(t.getHours()).padStart(2, "0")}时
              </span>
              <span className="text-lg leading-none" aria-hidden>
                {weatherEmoji(h.conditionText)}
              </span>
              <span className="text-xs font-medium">
                {h.tempC !== null ? `${Math.round(h.tempC)}°` : "--"}
              </span>
              {h.precipProbPct !== null && h.precipProbPct > 0 ? (
                <span className="text-[10px] text-sky-600 dark:text-sky-400">{h.precipProbPct}%</span>
              ) : (
                <span className="text-[10px] text-transparent">0</span>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-1 text-right text-[10px] text-slate-400">百分比为降水概率</p>
    </div>
  );
}
