import type { LodgingInfo } from "@ski/shared";
import { LODGING_TYPE_LABELS, formatPrice } from "@ski/shared";

const LINK_LABELS: Record<string, string> = {
  ctrip: "携程",
  meituan: "美团",
  official: "官方",
};

function distanceText(m: number | null): string | null {
  if (m === null) return null;
  if (m === 0) return "雪场内";
  if (m < 1000) return `距雪场 ${m}m`;
  return `距雪场 ${(m / 1000).toFixed(1)}km`;
}

export function LodgingList({ lodgings, resortName }: { lodgings: LodgingInfo[]; resortName: string }) {
  const searchLinks = [
    {
      label: "在携程搜索周边酒店",
      href: `https://hotels.ctrip.com/hotels/list?keyword=${encodeURIComponent(resortName)}`,
    },
    {
      label: "在美团搜索周边住宿",
      href: `https://www.meituan.com/s/${encodeURIComponent(resortName)}`,
    },
  ];

  return (
    <div className="space-y-3">
      {lodgings.length === 0 ? (
        <p className="rounded-xl bg-slate-100 py-6 text-center text-sm text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
          周边住宿信息整理中
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {lodgings.map((l) => (
            <div
              key={l.id}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold">{l.name}</h3>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {LODGING_TYPE_LABELS[l.type]}
                    {l.isSkiInOut && (
                      <span className="ml-1.5 rounded bg-sky-50 px-1.5 py-0.5 text-[10px] text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                        滑进滑出
                      </span>
                    )}
                    {distanceText(l.distanceToResortM) && (
                      <span className="ml-1.5">{distanceText(l.distanceToResortM)}</span>
                    )}
                  </p>
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
                    <span className="text-xs text-slate-400">价格以平台为准</span>
                  )}
                </div>
              </div>
              {Object.keys(l.links).length > 0 && (
                <div className="mt-3 flex gap-2">
                  {Object.entries(l.links).map(([key, href]) => (
                    <a
                      key={key}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-sky-300 hover:text-sky-600 dark:border-slate-700 dark:text-slate-300"
                    >
                      {LINK_LABELS[key] ?? key} ↗
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {searchLinks.map((s) => (
          <a
            key={s.href}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="rounded-full bg-slate-100 px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {s.label} ↗
          </a>
        ))}
      </div>
      <p className="text-[11px] text-slate-400">
        价格与房态以携程/美团等平台实时信息为准，本站仅作参考与跳转。
      </p>
    </div>
  );
}
