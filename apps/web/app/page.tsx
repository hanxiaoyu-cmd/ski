import Link from "next/link";
import { api } from "../lib/api";
import { ResortCard } from "../components/resort-card";

export const revalidate = 600;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ province?: string }>;
}) {
  const { province } = await searchParams;
  const all = await api.listResorts();
  const provinces = [...new Set(all.map((r) => r.province))];
  const resorts = province ? all.filter((r) => r.province === province) : all;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">滑雪场一览</h1>
        <p className="mt-2 text-sm text-slate-400">
          {all.length} 家雪场的天气、雪况与票价，持续更新
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <FilterPill href="/" active={!province} label="全部" />
        {provinces.map((p) => (
          <FilterPill
            key={p}
            href={`/?province=${encodeURIComponent(p)}`}
            active={province === p}
            label={p}
          />
        ))}
      </div>

      {resorts.length === 0 ? (
        <p className="py-20 text-center text-slate-400">该地区暂无收录雪场</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {resorts.map((r) => (
            <ResortCard key={r.slug} resort={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPill({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full bg-sky-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm shadow-sky-600/30"
          : "rounded-full bg-slate-50 px-4 py-1.5 text-sm text-slate-500 transition hover:bg-sky-50 hover:text-sky-600 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800"
      }
    >
      {label}
    </Link>
  );
}
