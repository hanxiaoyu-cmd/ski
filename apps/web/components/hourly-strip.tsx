import type { HourlyForecast } from "@ski/shared";
import { WeatherGlyph } from "./weather-glyph";

export function HourlyStrip({ hourly }: { hourly: HourlyForecast[] }) {
  if (hourly.length === 0) {
    return (
      <p className="rounded-2xl bg-slate-50 py-8 text-center text-sm text-slate-400 dark:bg-slate-900">
        暂无逐小时数据（采集任务运行后自动展示）
      </p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100 p-4 dark:border-slate-800/80">
      <div className="flex min-w-max gap-2">
        {hourly.map((h) => {
          const t = new Date(h.forecastTime);
          return (
            <div key={h.forecastTime} className="flex w-14 shrink-0 flex-col items-center gap-1.5 text-center">
              <span className="text-[11px] text-slate-400">{String(t.getHours()).padStart(2, "0")}时</span>
              <WeatherGlyph text={h.conditionText} size={20} />
              <span className="text-sm font-medium">
                {h.tempC !== null ? `${Math.round(h.tempC)}°` : "--"}
              </span>
              {h.precipProbPct !== null && h.precipProbPct > 0 ? (
                <span className="text-[10px] font-medium text-sky-500">{h.precipProbPct}%</span>
              ) : (
                <span className="text-[10px] text-transparent">·</span>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-right text-[10px] text-slate-300 dark:text-slate-500">百分比为降水概率</p>
    </div>
  );
}
