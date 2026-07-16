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
      <div className="mb-6">
        <h1 className="text-2xl font-bold">滑雪场一览</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {all.length} 家雪场的天气、雪况与票价信息，持续更新中
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
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
        <p className="py-16 text-center text-slate-500">该地区暂无收录雪场</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          ? "rounded-full bg-sky-600 px-3.5 py-1.5 text-sm font-medium text-white"
          : "rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm text-slate-600 hover:border-sky-300 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
      }
    >
      {label}
    </Link>
  );
}
