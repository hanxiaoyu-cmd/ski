import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  BedDouble,
  CalendarDays,
  Clock3,
  Globe,
  Map as MapIcon,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Route,
  Ticket,
} from "lucide-react";
import { ApiError } from "@ski/api-client";
import { TRAIL_DIFFICULTY_LABELS, type TrailDifficulty } from "@ski/shared";
import { api } from "../../../lib/api";
import { ForecastStrip } from "../../../components/forecast-strip";
import { HourlyStrip } from "../../../components/hourly-strip";
import { TicketTable } from "../../../components/ticket-table";
import { LodgingList } from "../../../components/lodging-list";
import { TransportCards } from "../../../components/transport-cards";
import { ResortCover } from "../../../components/resort-cover";
import { SectionTitle } from "../../../components/section-title";
import { TrailMapVector } from "../../../components/trail-map-vector";
import { WeatherGlyph } from "../../../components/weather-glyph";
import { TRAIL_GEO_SLUGS } from "../../../lib/trail-geo-manifest";

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
  const [weather, tickets, lodgings] = await Promise.all([
    api.getResortWeather(slug),
    api.getResortTickets(slug),
    api.getResortLodgings(slug),
  ]);
  const now = weather.now;

  return (
    <article className="space-y-10">
      <div className="h-44 w-full overflow-hidden rounded-3xl sm:h-60">
        <ResortCover slug={resort.slug} name={resort.name} imageUrl={resort.coverImageUrl} />
      </div>

      <header>
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{resort.name}</h1>
            <p className="mt-2 flex items-center gap-1 text-sm text-slate-400">
              <MapPin size={14} strokeWidth={2} />
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
            <div className="flex items-center gap-4 rounded-2xl border border-slate-100 px-5 py-3.5 dark:border-slate-800/80">
              <WeatherGlyph text={now.conditionText} size={36} />
              <div>
                <div className="text-2xl font-bold tracking-tight">
                  {now.tempC !== null ? `${Math.round(now.tempC)}°` : "--"}
                  <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">
                    {now.conditionText ?? ""}
                  </span>
                </div>
                <div className="mt-0.5 text-xs text-slate-400">
                  体感 {now.feelsLikeC !== null ? `${Math.round(now.feelsLikeC)}°` : "--"}
                  {now.windDir ? ` · ${now.windDir} ${now.windSpeedKmh ?? "--"}km/h` : ""}
                </div>
              </div>
            </div>
          )}
        </div>
        {resort.intro && (
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-500 dark:text-slate-300">
            {resort.intro}
          </p>
        )}
      </header>

      <section>
        <SectionTitle icon={Clock3}>未来 24 小时</SectionTitle>
        <HourlyStrip hourly={weather.hourly} />
      </section>

      <section>
        <SectionTitle icon={CalendarDays}>未来 7 日预报</SectionTitle>
        <ForecastStrip daily={weather.daily} />
      </section>

      {(TRAIL_GEO_SLUGS as readonly string[]).includes(slug) && (
        <section>
          <SectionTitle icon={Route}>雪道分布（可交互）</SectionTitle>
          <TrailMapVector slug={slug} />
        </section>
      )}

      {resort.trailMapUrl && (
        <section>
          <SectionTitle icon={MapIcon}>官方雪道图</SectionTitle>
          <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800/80">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resort.trailMapUrl} alt={`${resort.name}官方雪道图`} className="w-full" loading="lazy" />
          </div>
          <p className="mt-2 text-[11px] text-slate-300 dark:text-slate-500">
            雪道图版权归雪场所有，如有更新以官方为准
          </p>
        </section>
      )}

      {resort.trailStats && resort.trailStats.total > 0 && (
        <section>
          <SectionTitle icon={Route}>雪道构成（{resort.trailStats.total} 条）</SectionTitle>
          <div className="flex flex-wrap gap-2.5">
            {(Object.entries(resort.trailStats.byDifficulty) as [TrailDifficulty, number][]).map(
              ([difficulty, count]) => (
                <span
                  key={difficulty}
                  className="flex items-center gap-2 rounded-full border border-slate-100 px-4 py-1.5 text-sm dark:border-slate-800/80"
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${DIFFICULTY_DOT[difficulty]}`} />
                  {TRAIL_DIFFICULTY_LABELS[difficulty]} × {count}
                </span>
              ),
            )}
          </div>
        </section>
      )}

      {resort.transport && resort.transport.length > 0 && (
        <section>
          <SectionTitle icon={Navigation}>如何抵达</SectionTitle>
          <TransportCards items={resort.transport} />
          <p className="mt-2 text-[11px] text-slate-300 dark:text-slate-500">
            交通信息为整理参考，出行前请以铁路/航空/雪场官方最新信息为准
          </p>
        </section>
      )}

      <section>
        <SectionTitle icon={Ticket}>票价</SectionTitle>
        <TicketTable tickets={tickets} />
      </section>

      <section>
        <SectionTitle icon={BedDouble}>周边住宿</SectionTitle>
        <LodgingList lodgings={lodgings} resortName={resort.name} />
      </section>

      {(resort.officialWechatName || resort.officialWebsite || resort.phone) && (
        <section className="rounded-2xl border border-slate-100 p-6 dark:border-slate-800/80">
          <h2 className="mb-3 text-sm font-semibold tracking-tight">官方渠道</h2>
          <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-300">
            {resort.officialWechatName && (
              <li className="flex items-center gap-2">
                <MessageCircle size={14} className="text-slate-300 dark:text-slate-500" />
                微信公众号：{resort.officialWechatName}
              </li>
            )}
            {resort.officialWebsite && (
              <li className="flex items-center gap-2">
                <Globe size={14} className="text-slate-300 dark:text-slate-500" />
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
            {resort.phone && (
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-slate-300 dark:text-slate-500" />
                {resort.phone}
              </li>
            )}
          </ul>
        </section>
      )}
    </article>
  );
}
