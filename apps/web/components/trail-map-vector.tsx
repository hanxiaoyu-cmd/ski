"use client";

import { useEffect, useMemo, useState } from "react";

interface GeoTrail {
  id: number;
  name: string | null;
  difficulty: string | null; // OSM piste:difficulty
  points: [number, number][]; // [lng, lat]
}
interface GeoLift {
  id: number;
  name: string | null;
  type: string;
  points: [number, number][];
}
interface TrailGeo {
  slug: string;
  trails: GeoTrail[];
  lifts: GeoLift[];
}

const DIFF_COLOR: Record<string, string> = {
  novice: "#22c55e",
  easy: "#22c55e",
  intermediate: "#3b82f6",
  advanced: "#ef4444",
  expert: "#0f172a",
  freeride: "#f59e0b",
};
const DIFF_LABEL: Record<string, string> = {
  novice: "初级",
  easy: "初级",
  intermediate: "中级",
  advanced: "高级",
  expert: "专家",
  freeride: "野雪",
};

const LIFT_COLOR = "#475569";
const W = 1000; // viewBox 宽度基准

type LiftKind = "cabin" | "chair" | "carpet" | "surface";
function liftKind(type: string): LiftKind {
  if (type === "gondola" || type === "cable_car" || type === "mixed_lift") return "cabin";
  if (type === "chair_lift") return "chair";
  if (type === "magic_carpet") return "carpet";
  return "surface";
}
const LIFT_KIND_LABEL: Record<LiftKind, string> = {
  cabin: "吊箱缆车",
  chair: "吊椅缆车",
  carpet: "魔毯",
  surface: "拖牵",
};

/** 缆车小图标：画在线路中点，按类型区分轿厢/吊椅/魔毯/拖牵 */
function LiftIcon({ x, y, kind }: { x: number; y: number; kind: LiftKind }) {
  if (kind === "cabin") {
    return (
      <g transform={`translate(${x} ${y})`} stroke={LIFT_COLOR} fill="white" strokeWidth={1.6}>
        <line x1={0} y1={0} x2={0} y2={5} />
        <rect x={-6} y={5} width={12} height={10} rx={2.5} fill="white" />
        <line x1={-6} y1={9.5} x2={6} y2={9.5} strokeWidth={1.2} />
      </g>
    );
  }
  if (kind === "chair") {
    return (
      <g transform={`translate(${x} ${y})`} stroke={LIFT_COLOR} fill="none" strokeWidth={1.8} strokeLinecap="round">
        <line x1={0} y1={0} x2={0} y2={7} />
        <line x1={-5} y1={7} x2={5} y2={7} />
        <line x1={-5} y1={7} x2={-5} y2={12} />
        <line x1={5} y1={7} x2={5} y2={12} />
        <line x1={-5} y1={12} x2={2} y2={12} />
      </g>
    );
  }
  if (kind === "carpet") {
    return (
      <g transform={`translate(${x} ${y})`}>
        <rect x={-7} y={-3} width={14} height={6} rx={3} fill="white" stroke={LIFT_COLOR} strokeWidth={1.6} />
        <line x1={-3} y1={0} x2={3} y2={0} stroke={LIFT_COLOR} strokeWidth={1.4} strokeDasharray="1.5 1.5" />
      </g>
    );
  }
  return (
    <g transform={`translate(${x} ${y})`} stroke={LIFT_COLOR} fill="white" strokeWidth={1.6} strokeLinecap="round">
      <circle r={6} />
      <line x1={-3} y1={-1.5} x2={3} y2={-1.5} />
      <line x1={0} y1={-1.5} x2={0} y2={3.5} />
    </g>
  );
}

/**
 * OSM 矢量雪道图：雪道按难度着色可悬停；缆车带类型图标与站点标记。
 * openTrailNames 预留：传入后开放雪道保持彩色，未开放变灰（Phase 5 接每日开放数据）。
 */
export function TrailMapVector({
  slug,
  openTrailNames = null,
}: {
  slug: string;
  openTrailNames?: string[] | null;
}) {
  const [geo, setGeo] = useState<TrailGeo | null>(null);
  const [failed, setFailed] = useState(false);
  const [hover, setHover] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/trail-geo/${slug}.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(setGeo)
      .catch(() => setFailed(true));
  }, [slug]);

  const view = useMemo(() => {
    if (!geo) return null;
    const all = [...geo.trails, ...geo.lifts].flatMap((t) => t.points);
    if (all.length === 0) return null;
    const lngs = all.map((p) => p[0]);
    const lats = all.map((p) => p[1]);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const cosLat = Math.cos(((minLat + maxLat) / 2) * (Math.PI / 180));
    const spanX = (maxLng - minLng) * cosLat || 1e-6;
    const spanY = maxLat - minLat || 1e-6;
    const H = Math.max(340, Math.min(780, (W * spanY) / spanX));
    const pad = 0.05;
    const px = (lng: number) => (((lng - minLng) * cosLat) / spanX) * W * (1 - 2 * pad) + W * pad;
    const py = (lat: number) => ((maxLat - lat) / spanY) * H * (1 - 2 * pad) + H * pad;
    const d = (pts: [number, number][]) =>
      pts.map(([lng, lat], i) => `${i === 0 ? "M" : "L"}${px(lng).toFixed(1)} ${py(lat).toFixed(1)}`).join("");
    const mid = (pts: [number, number][]) => {
      const [lng, lat] = pts[Math.floor(pts.length / 2)];
      return { x: px(lng), y: py(lat) };
    };
    const pt = (p: [number, number]) => ({ x: px(p[0]), y: py(p[1]) });
    return { H, d, mid, pt };
  }, [geo]);

  if (failed) {
    return (
      <p className="rounded-2xl bg-slate-50 py-8 text-center text-sm text-slate-400 dark:bg-slate-900">
        矢量雪道图加载失败
      </p>
    );
  }
  if (!geo || !view) {
    return <div className="h-72 animate-pulse rounded-2xl bg-slate-50 dark:bg-slate-900" />;
  }

  const isOpen = (name: string | null) =>
    openTrailNames === null || (name !== null && openTrailNames.includes(name));

  const diffsPresent = [...new Set(geo.trails.map((t) => t.difficulty ?? ""))].filter(
    (d) => d && DIFF_LABEL[d],
  );
  const liftKindsPresent = [...new Set(geo.lifts.map((l) => liftKind(l.type)))];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800/80">
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${view.H}`}
          className="block w-full bg-gradient-to-b from-sky-50/60 to-white dark:from-slate-900 dark:to-slate-950"
          role="img"
          aria-label="雪道分布图"
        >
          {/* 雪道 */}
          {geo.trails.map((t) => {
            const open = isOpen(t.name);
            const color = open ? (DIFF_COLOR[t.difficulty ?? ""] ?? "#64748b") : "#cbd5e1";
            return (
              <path
                key={`trail-${t.id}`}
                d={view.d(t.points)}
                fill="none"
                stroke={color}
                strokeWidth={hover === `t${t.id}` ? 7 : 4.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={open ? 0.9 : 0.5}
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHover(`t${t.id}`)}
                onMouseLeave={() => setHover(null)}
              >
                <title>
                  {(t.name ?? "未命名雪道") +
                    (t.difficulty && DIFF_LABEL[t.difficulty] ? ` · ${DIFF_LABEL[t.difficulty]}` : "")}
                </title>
              </path>
            );
          })}
          {/* 缆车线 + 站点 + 类型图标 */}
          {geo.lifts.map((l) => {
            const kind = liftKind(l.type);
            const m = view.mid(l.points);
            const a = view.pt(l.points[0]);
            const b = view.pt(l.points[l.points.length - 1]);
            const hovered = hover === `l${l.id}`;
            return (
              <g
                key={`lift-${l.id}`}
                className="cursor-pointer"
                onMouseEnter={() => setHover(`l${l.id}`)}
                onMouseLeave={() => setHover(null)}
                opacity={hovered ? 1 : 0.85}
              >
                <path d={view.d(l.points)} fill="none" stroke="transparent" strokeWidth={14} />
                <path
                  d={view.d(l.points)}
                  fill="none"
                  stroke={LIFT_COLOR}
                  strokeWidth={hovered ? 3 : 2}
                  strokeDasharray="7 5"
                />
                <rect x={a.x - 3.5} y={a.y - 3.5} width={7} height={7} fill={LIFT_COLOR} rx={1.5} />
                <rect x={b.x - 3.5} y={b.y - 3.5} width={7} height={7} fill={LIFT_COLOR} rx={1.5} />
                <LiftIcon x={m.x} y={m.y} kind={kind} />
                <title>{`${LIFT_KIND_LABEL[kind]}${l.name ? ` · ${l.name}` : ""}`}</title>
              </g>
            );
          })}
        </svg>
        {hover && (
          <div className="pointer-events-none absolute left-3 top-3 rounded-lg bg-slate-900/85 px-3 py-1.5 text-xs font-medium text-white backdrop-blur dark:bg-white/90 dark:text-slate-900">
            {(() => {
              if (hover.startsWith("t")) {
                const t = geo.trails.find((x) => `t${x.id}` === hover);
                if (!t) return null;
                return (
                  (t.name ?? "未命名雪道") +
                  (t.difficulty && DIFF_LABEL[t.difficulty] ? ` · ${DIFF_LABEL[t.difficulty]}` : "")
                );
              }
              const l = geo.lifts.find((x) => `l${x.id}` === hover);
              if (!l) return null;
              return `${LIFT_KIND_LABEL[liftKind(l.type)]}${l.name ? ` · ${l.name}` : ""}`;
            })()}
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-slate-100 px-4 py-2.5 text-[11px] text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
        {diffsPresent.map((d) => (
          <span key={d} className="flex items-center gap-1.5">
            <span className="h-1 w-4 rounded-full" style={{ background: DIFF_COLOR[d] }} />
            {DIFF_LABEL[d]}
          </span>
        ))}
        {liftKindsPresent.map((k) => (
          <span key={k} className="flex items-center gap-1.5">
            <svg width="18" height="18" viewBox="-9 -2 18 18">
              <LiftIcon x={0} y={0} kind={k} />
            </svg>
            {LIFT_KIND_LABEL[k]}
          </span>
        ))}
        <span className="ml-auto text-slate-300 dark:text-slate-500">
          {geo.trails.length} 条雪道 · {geo.lifts.length} 条缆车 · © OpenStreetMap
        </span>
      </div>
    </div>
  );
}
