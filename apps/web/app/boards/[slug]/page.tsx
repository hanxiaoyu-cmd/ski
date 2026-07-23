import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink, Layers, Snowflake } from "lucide-react";
import { ApiError } from "@ski/api-client";
import {
  BOARD_CATEGORY_LABELS,
  BOARD_TYPE_LABELS,
  BOARD_LEVEL_LABELS,
  BOARD_GENDER_LABELS,
  CAMBER_LABELS,
  SHAPE_LABELS,
  flexLabel,
  formatPrice,
} from "@ski/shared";
import { api } from "../../../lib/api";
import { BoardSizeGuide } from "../../../components/board-size-guide";

export const revalidate = 3600;

async function fetchBoard(slug: string) {
  try {
    return await api.getBoard(slug);
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
  const b = await fetchBoard(slug);
  return {
    title: `${b.brand} ${b.name}${b.year ? " " + b.year : ""} 参数与选购`,
    description: `${b.brand} ${b.name} 的板型、硬度、尺寸与适用水平等参数。${b.intro ?? ""}`,
  };
}

function Spec({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between border-b border-slate-50 py-2.5 text-sm last:border-0 dark:border-slate-800/50">
      <dt className="text-slate-400">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

export default async function BoardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const b = await fetchBoard(slug);
  const price = b.priceCents;
  const priceFrom = b.priceFromCents;

  return (
    <article className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex h-64 items-center justify-center overflow-hidden rounded-3xl bg-slate-50 dark:bg-slate-800/40">
          {b.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={b.coverImageUrl} alt={`${b.brand} ${b.name}`} className="h-full w-full object-contain p-6" />
          ) : (
            <div className="text-slate-200 dark:text-slate-700">
              {b.category === "SKI" ? <Layers size={64} strokeWidth={1} /> : <Snowflake size={64} strokeWidth={1} />}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <p className="text-sm font-medium uppercase tracking-wide text-sky-600 dark:text-sky-400">
            {b.brand}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            {b.name}
            {b.year ? <span className="ml-2 text-base font-normal text-slate-400">{b.year}</span> : null}
          </h1>
          <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            {BOARD_CATEGORY_LABELS[b.category]}
          </span>

          {b.highlights.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {b.highlights.map((h) => (
                <span
                  key={h}
                  className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-950 dark:text-sky-300"
                >
                  {h}
                </span>
              ))}
            </div>
          )}

          {b.intro && (
            <p className="mt-4 text-sm leading-relaxed text-slate-500 dark:text-slate-300">{b.intro}</p>
          )}

          <div className="mt-auto flex items-center gap-3 pt-5">
            {(price ?? priceFrom) !== null && (
              <span className="text-xl font-bold text-sky-700 dark:text-sky-400">
                {formatPrice((priceFrom ?? price)!)}
                {priceFrom !== null && <span className="text-sm font-normal"> 起</span>}
              </span>
            )}
            {b.buyUrl && (
              <a
                href={b.buyUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="flex items-center gap-1 rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
              >
                去购买
                <ExternalLink size={13} strokeWidth={2} />
              </a>
            )}
            {b.officialUrl && (
              <a
                href={b.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-500 transition hover:border-sky-300 hover:text-sky-600 dark:border-slate-700 dark:text-slate-300"
              >
                官网
                <ExternalLink size={13} strokeWidth={2} />
              </a>
            )}
          </div>
        </div>
      </div>

      <section className="grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="mb-2 text-lg font-semibold tracking-tight">参数</h2>
          <dl className="rounded-2xl border border-slate-100 px-5 dark:border-slate-800/80">
            <Spec label="用途" value={b.boardType ? (BOARD_TYPE_LABELS[b.boardType] ?? b.boardType) : null} />
            <Spec label="板型" value={b.camber ? (CAMBER_LABELS[b.camber] ?? b.camber) : null} />
            <Spec label="形状" value={b.shape ? (SHAPE_LABELS[b.shape] ?? b.shape) : null} />
            <Spec label="硬度" value={b.flex !== null ? `${b.flex} / 10 · ${flexLabel(b.flex)}` : null} />
            <Spec label="适用水平" value={b.level ? (BOARD_LEVEL_LABELS[b.level] ?? b.level) : null} />
            <Spec label="性别" value={b.gender ? (BOARD_GENDER_LABELS[b.gender] ?? b.gender) : null} />
            <Spec label="可选长度" value={b.sizesCm.length ? b.sizesCm.map((s) => `${s}cm`).join(" / ") : null} />
            <Spec label="款式年份" value={b.year ? String(b.year) : null} />
          </dl>
        </div>

        <BoardSizeGuide category={b.category} />
      </section>
    </article>
  );
}
