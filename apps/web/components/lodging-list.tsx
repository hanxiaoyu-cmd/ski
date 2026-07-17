import { Car, ExternalLink, Footprints, MapPin, MapPinned } from "lucide-react";
import type { LodgingInfo } from "@ski/shared";
import { LODGING_TYPE_LABELS, formatPrice, formatStraightDistance, walkingMinutes } from "@ski/shared";

const LINK_LABELS: Record<string, string> = {
  ctrip: "携程预订",
  meituan: "美团预订",
  official: "官网",
  amap: "地图",
};

function DistanceLine({ distanceM }: { distanceM: number | null }) {
  if (distanceM === null) {
    return <p className="mt-1.5 text-xs text-slate-400">距离待核实</p>;
  }
  if (distanceM === 0) {
    return (
      <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-sky-600 dark:text-sky-400">
        <MapPin size={12} strokeWidth={2} />
        雪场内
      </p>
    );
  }
  if (distanceM <= 2500) {
    return (
      <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
        <Footprints size={12} strokeWidth={2} className="text-sky-500" />
        步行约{walkingMinutes(distanceM)}分钟
        <span className="font-normal text-slate-400">· 直线{formatStraightDistance(distanceM)}</span>
      </p>
    );
  }
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
      <Car size={12} strokeWidth={2} className="text-slate-400" />
      车程约{Math.max(1, Math.ceil(distanceM / 500))}分钟
      <span className="font-normal text-slate-400">· 直线{formatStraightDistance(distanceM)}</span>
    </p>
  );
}

export function LodgingList({ lodgings, resortName }: { lodgings: LodgingInfo[]; resortName: string }) {
  return (
    <div className="space-y-4">
      {lodgings.length === 0 ? (
        <p className="rounded-2xl bg-slate-50 py-8 text-center text-sm text-slate-400 dark:bg-slate-900">
          周边住宿信息整理中
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {lodgings.map((l) => (
            <div
              key={l.id}
              className="rounded-2xl border border-slate-100 p-5 transition hover:border-slate-200 dark:border-slate-800/80"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold tracking-tight">{l.name}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                    {LODGING_TYPE_LABELS[l.type]}
                    {l.isSkiInOut && (
                      <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-600 dark:bg-sky-950 dark:text-sky-300">
                        滑进滑出
                      </span>
                    )}
                  </p>
                  <DistanceLine distanceM={l.distanceToResortM} />
                </div>
                <div className="shrink-0 text-right">
                  {l.priceMinCents !== null ? (
                    <>
                      <span className="text-sm font-semibold">
                        {formatPrice(l.priceMinCents)}
                        {l.priceMaxCents !== null && l.priceMaxCents !== l.priceMinCents
                          ? ` ~ ${formatPrice(l.priceMaxCents)}`
                          : ""}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        {l.priceUpdatedAt ? `更新于 ${l.priceUpdatedAt.slice(0, 10)}` : ""}
                      </p>
                    </>
                  ) : (
                    <span className="text-xs text-slate-300 dark:text-slate-500">价格以平台为准</span>
                  )}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {Object.entries({
                  ...l.links,
                  amap:
                    l.links.amap ?? `https://uri.amap.com/search?keyword=${encodeURIComponent(l.name)}`,
                }).map(([key, href]) => (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-sky-50 hover:text-sky-600 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    {LINK_LABELS[key] ?? key}
                    <ExternalLink size={11} strokeWidth={2} />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <a
          href={`https://uri.amap.com/search?keyword=${encodeURIComponent(`${resortName}附近酒店`)}`}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-500 transition hover:border-sky-300 hover:text-sky-600 dark:border-slate-700 dark:text-slate-300"
        >
          <MapPinned size={13} strokeWidth={2} />
          在高德地图查看周边住宿
        </a>
        <span className="text-[11px] text-slate-300 dark:text-slate-500">
          价格与房态以平台实时信息为准，本站仅作参考与跳转
        </span>
      </div>
    </div>
  );
}
