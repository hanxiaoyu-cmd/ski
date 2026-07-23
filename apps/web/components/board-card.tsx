import Link from "next/link";
import { Layers, Snowflake } from "lucide-react";
import type { BoardSummary } from "@ski/shared";
import {
  BOARD_TYPE_LABELS,
  BOARD_LEVEL_LABELS,
  CAMBER_LABELS,
  flexLabel,
  formatPrice,
} from "@ski/shared";

function BoardCover({ b }: { b: BoardSummary }) {
  if (b.coverImageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={b.coverImageUrl}
        alt={`${b.brand} ${b.name}`}
        className="h-full w-full object-contain p-4 transition duration-500 group-hover:scale-105"
        loading="lazy"
      />
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center text-slate-200 dark:text-slate-700">
      {b.category === "SKI" ? <Layers size={44} strokeWidth={1.2} /> : <Snowflake size={44} strokeWidth={1.2} />}
    </div>
  );
}

export function BoardCard({ board: b }: { board: BoardSummary }) {
  const price = b.priceFromCents ?? b.priceCents;
  return (
    <Link
      href={`/boards/${b.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white transition duration-200 hover:-translate-y-1 hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/60 dark:border-slate-800/80 dark:bg-slate-900 dark:hover:shadow-black/30"
    >
      <div className="h-40 w-full overflow-hidden bg-slate-50 dark:bg-slate-800/40">
        <BoardCover b={b} />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-sky-600 dark:text-sky-400">
          {b.brand}
        </p>
        <h2 className="mt-0.5 text-sm font-semibold tracking-tight group-hover:text-sky-600 dark:group-hover:text-sky-400">
          {b.name}
          {b.year ? <span className="ml-1 text-xs font-normal text-slate-400">{b.year}</span> : null}
        </h2>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {b.boardType && BOARD_TYPE_LABELS[b.boardType] && (
            <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              {BOARD_TYPE_LABELS[b.boardType]}
            </span>
          )}
          {b.camber && CAMBER_LABELS[b.camber] && (
            <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              {CAMBER_LABELS[b.camber]}
            </span>
          )}
          {b.flex !== null && (
            <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              硬度{b.flex} · {flexLabel(b.flex)}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between pt-3">
          <span className="text-xs text-slate-400">
            {b.level && BOARD_LEVEL_LABELS[b.level] ? BOARD_LEVEL_LABELS[b.level] : ""}
          </span>
          {price !== null ? (
            <span className="text-sm font-semibold text-sky-700 dark:text-sky-400">
              {formatPrice(price)}
              {b.priceFromCents !== null && <span className="text-xs font-normal"> 起</span>}
            </span>
          ) : (
            <span className="text-xs text-slate-300 dark:text-slate-500">价格见详情</span>
          )}
        </div>
      </div>
    </Link>
  );
}
