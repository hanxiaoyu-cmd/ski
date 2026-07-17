import { Snowflake } from "lucide-react";
import type { DailyForecast } from "@ski/shared";
import { WeatherGlyph } from "./weather-glyph";

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
      <p className="rounded-2xl bg-slate-50 py-8 text-center text-sm text-slate-400 dark:bg-slate-900">
        暂无预报数据（天气采集接入后自动展示）
      </p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max gap-3">
        {daily.map((d) => (
          <div
            key={d.forecastDate}
            className="flex w-26 shrink-0 flex-col items-center gap-1 rounded-2xl border border-slate-100 px-3 py-4 text-center transition hover:border-slate-200 dark:border-slate-800/80"
          >
            <span className="text-xs font-medium">{dayLabel(d.forecastDate)}</span>
            <span className="text-[10px] text-slate-400">{d.forecastDate.slice(5).replace("-", "/")}</span>
            <WeatherGlyph text={d.conditionDay} size={26} className="my-1.5" />
            <span className="text-xs text-slate-500 dark:text-slate-400">{d.conditionDay ?? "--"}</span>
            <span className="text-sm">
              <span className="font-semibold">{d.tempMaxC ?? "--"}°</span>
              <span className="ml-1 text-slate-400">{d.tempMinC ?? "--"}°</span>
            </span>
            {d.snowfallMm !== null && d.snowfallMm > 0 && (
              <span className="mt-1 flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-600 dark:bg-sky-950 dark:text-sky-300">
                <Snowflake size={10} />
                {d.snowfallMm}mm
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
