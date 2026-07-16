import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiError } from "@ski/api-client";
import { TRAIL_DIFFICULTY_LABELS, type TrailDifficulty } from "@ski/shared";
import { api } from "../../../lib/api";
import { weatherEmoji } from "../../../lib/weather-icon";
import { ForecastStrip } from "../../../components/forecast-strip";
import { TicketTable } from "../../../components/ticket-table";

export const revalidate = 900;

async function fetchResort(slug: string) {
  try {
    return await api.getResort(slug);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resort = await fetchResort(slug);
  return {
    title: `${resort.name} 天气·雪况·票价`,
    description: `${resort.name}（${resort.province}${resort.city}）实时天气、7 日预报、雪道信息与票价查询。${resort.intro ?? ""}`,
  };
}

const DIFFICULTY_DOT: Record<TrailDifficulty, string> = {
  GREEN: "bg-green-500",
  BLUE: "bg-blue-500",
  RED: "bg-red-500",
  BLACK: "bg-slate-900 dark:bg-slate-200",
};

export default async function ResortPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resort = await fetchResort(slug);
  const [weather, tickets] = await Promise.all([
    api.getResortWeather(slug),
    api.getResortTickets(slug),
  ]);
  const now = weather.now;

  return (
    <article className="space-y-8">
      <header>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{resort.name}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {resort.province} · {resort.city}
              {resort.altitudeBaseM && resort.altitudeTopM
                ? ` · 海拔 ${resort.altitudeBaseM}-${resort.altitudeTopM}m`
                : ""}
              {resort.seasonOpen && resort.seasonClose
                ? ` · 雪季 ${resort.seasonOpen.replace("-", ".")}~${resort.seasonClose.replace("-", ".")}`
                : ""}
            </p>
          </div>
          {now && (
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-3xl" aria-hidden>
                {weatherEmoji(now.conditionText)}
              </span>
              <div>
                <div className="text-xl font-bold">
                  {now.tempC !== null ? `${Math.round(now.tempC)}°C` : "--"}
                  <span className="ml-1.5 text-sm font-normal text-slate-500">
                    {now.conditionText ?? ""}
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  体感 {now.feelsLikeC !== null ? `${Math.round(now.feelsLikeC)}°C` : "--"}
                  {now.windDir ? ` · ${now.windDir} ${now.windSpeedKmh ?? "--"}km/h` : ""}
                </div>
              </div>
            </div>
          )}
        </div>
        {resort.intro && (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {resort.intro}
          </p>
        )}
      </header>

      <section>
        <h2 className="mb-3 text-lg font-semibold">未来 7 日预报</h2>
        <ForecastStrip daily={weather.daily} />
      </section>

      {resort.trailStats && resort.trailStats.total > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">雪道构成（{resort.trailStats.total} 条）</h2>
          <div className="flex flex-wrap gap-3">
            {(Object.entries(resort.trailStats.byDifficulty) as [TrailDifficulty, number][]).map(
              ([difficulty, count]) => (
                <span
                  key={difficulty}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${DIFFICULTY_DOT[difficulty]}`} />
                  {TRAIL_DIFFICULTY_LABELS[difficulty]} × {count}
                </span>
              ),
            )}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">票价</h2>
        <TicketTable tickets={tickets} />
      </section>

      {(resort.officialWechatName || resort.officialWebsite || resort.phone) && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-2 font-semibold">官方渠道</h2>
          <ul className="space-y-1 text-slate-600 dark:text-slate-300">
            {resort.officialWechatName && <li>微信公众号：{resort.officialWechatName}</li>}
            {resort.officialWebsite && (
              <li>
                官网：
                <a
                  href={resort.officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 hover:underline dark:text-sky-400"
                >
                  {resort.officialWebsite}
                </a>
              </li>
            )}
            {resort.phone && <li>电话：{resort.phone}</li>}
          </ul>
        </section>
      )}
    </article>
  );
}
