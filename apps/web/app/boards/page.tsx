import Link from "next/link";
import { api } from "../../lib/api";
import { BoardCard } from "../../components/board-card";
import { BOARD_TYPE_LABELS, BOARD_LEVEL_LABELS } from "@ski/shared";

export const revalidate = 3600;

const CATEGORY_TABS = [
  { key: "", label: "全部" },
  { key: "SNOWBOARD", label: "单板" },
  { key: "SKI", label: "双板" },
];

export default async function BoardsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; brand?: string; boardType?: string; level?: string }>;
}) {
  const { category, brand, boardType, level } = await searchParams;
  const boards = await api.listBoards({ category, brand, boardType, level });

  // 从当前结果聚合可选筛选项
  const brands = [...new Set(boards.map((b) => b.brand))].sort();
  const types = [...new Set(boards.map((b) => b.boardType).filter(Boolean) as string[])];

  const mk = (patch: Record<string, string | undefined>) => {
    const next = { category, brand, boardType, level, ...patch };
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(next)) if (v) qs.set(k, v);
    const s = qs.toString();
    return s ? `/boards?${s}` : "/boards";
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">雪板装备库</h1>
        <p className="mt-2 text-sm text-slate-400">{boards.length} 款单板 / 双板的参数、板型与选购参考</p>
      </div>

      {/* category 切换 */}
      <div className="mb-4 inline-flex rounded-full bg-slate-100 p-1 dark:bg-slate-800/80">
        {CATEGORY_TABS.map((t) => (
          <Link
            key={t.key}
            href={mk({ category: t.key || undefined, brand: undefined, boardType: undefined })}
            className={
              (category ?? "") === t.key
                ? "rounded-full bg-white px-4 py-1.5 text-sm font-medium text-sky-600 shadow-sm dark:bg-slate-950"
                : "rounded-full px-4 py-1.5 text-sm text-slate-500 transition hover:text-sky-600 dark:text-slate-300"
            }
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* 用途 + 水平筛选 */}
      <div className="mb-3 flex flex-wrap gap-2">
        <FilterPill href={mk({ boardType: undefined })} active={!boardType} label="全部用途" />
        {types.map((t) => (
          <FilterPill
            key={t}
            href={mk({ boardType: t })}
            active={boardType === t}
            label={BOARD_TYPE_LABELS[t] ?? t}
          />
        ))}
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        <FilterPill href={mk({ level: undefined })} active={!level} label="全部水平" />
        {(["beginner", "intermediate", "advanced", "expert"] as const).map((lv) => (
          <FilterPill key={lv} href={mk({ level: lv })} active={level === lv} label={BOARD_LEVEL_LABELS[lv]} />
        ))}
      </div>

      {/* 品牌筛选 */}
      <div className="mb-8 flex flex-wrap gap-2">
        <FilterPill href={mk({ brand: undefined })} active={!brand} label="全部品牌" />
        {brands.map((br) => (
          <FilterPill key={br} href={mk({ brand: br })} active={brand === br} label={br} />
        ))}
      </div>

      {boards.length === 0 ? (
        <p className="py-20 text-center text-slate-400">没有匹配的雪板，试试放宽筛选</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {boards.map((b) => (
            <BoardCard key={b.slug} board={b} />
          ))}
        </div>
      )}

      <p className="mt-10 text-[11px] text-slate-300 dark:text-slate-500">
        参数整理自品牌官网与公开评测，仅供参考；图片版权归品牌所有。
      </p>
    </div>
  );
}

function FilterPill({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full bg-sky-600 px-3.5 py-1 text-xs font-medium text-white shadow-sm shadow-sky-600/30"
          : "rounded-full bg-slate-50 px-3.5 py-1 text-xs text-slate-500 transition hover:bg-sky-50 hover:text-sky-600 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800"
      }
    >
      {label}
    </Link>
  );
}
