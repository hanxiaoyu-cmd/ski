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
type PoiKind = "peak" | "restaurant" | "cafe" | "parking" | "hotel" | "toilets" | "firstaid";
interface GeoPoi {
  kind: PoiKind;
  name: string | null;
  ele: number | null;
  point: [number, number];
}
interface TrailGeo {
  slug: string;
  trails: GeoTrail[];
  lifts: GeoLift[];
  pois?: GeoPoi[];
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
const W = 1000;

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
const POI_LABEL: Record<PoiKind, string> = {
  peak: "山峰",
  restaurant: "餐饮",
  cafe: "咖啡/酒吧",
  parking: "停车场",
  hotel: "住宿",
  toilets: "洗手间",
  firstaid: "急救",
};

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

/** POI 徽章图标：白底圆 + 手绘符号，统一 slate 描边 */
function PoiIcon({ x, y, kind }: { x: number; y: number; kind: PoiKind }) {
  if (kind === "peak") {
    return (
      <g transform={`translate(${x} ${y})`}>
        <path d="M-8 5 L0 -7 L8 5 Z" fill="#64748b" stroke="white" strokeWidth={1.2} />
        <path d="M-2.6 -3.1 L0 -7 L2.6 -3.1 L1.2 -4 L0 -2.6 L-1.2 -4 Z" fill="white" />
      </g>
    );
  }
  const badge = (inner: React.ReactNode) => (
    <g transform={`translate(${x} ${y})`}>
      <circle r={8} fill="white" stroke="#94a3b8" strokeWidth={1.2} />
      {inner}
    </g>
  );
  switch (kind) {
    case "restaurant":
      return badge(
        <g stroke="#475569" strokeWidth={1.4} strokeLinecap="round">
          <line x1={-2.5} y1={-4} x2={-2.5} y2={4} />
          <line x1={-4} y1={-4} x2={-4} y2={-1.2} />
          <line x1={-1} y1={-4} x2={-1} y2={-1.2} />
          <line x1={-4} y1={-1.2} x2={-1} y2={-1.2} />
          <path d="M2.5 4 L2.5 -4 Q4.5 -3 4.5 -0.5 L2.5 0.5" fill="none" />
        </g>,
      );
    case "cafe":
      return badge(
        <g stroke="#475569" strokeWidth={1.4} fill="none" strokeLinecap="round">
          <path d="M-3.5 -2.5 L-3.5 2 Q-3.5 4 -1 4 L1 4 Q3 4 3 2 L3 -2.5 Z" />
          <path d="M3 -1 Q5.5 -1 5.5 0.8 Q5.5 2.5 3 2" />
        </g>,
      );
    case "parking":
      return badge(
        <text y={4} textAnchor="middle" fontSize={10} fontWeight={700} fill="#2563eb">
          P
        </text>,
      );
    case "hotel":
      return badge(
        <g stroke="#475569" strokeWidth={1.4} fill="none" strokeLinecap="round">
          <line x1={-5} y1={-3} x2={-5} y2={4} />
          <line x1={-5} y1={4} x2={5.5} y2={4} />
          <circle cx={-2.8} cy={0} r={1.2} fill="#475569" stroke="none" />
          <path d="M-1 1.5 L4 1.5 Q5.5 1.5 5.5 3 L5.5 4" />
        </g>,
      );
    case "toilets":
      return badge(
        <text y={3.5} textAnchor="middle" fontSize={7} fontWeight={700} fill="#475569">
          WC
        </text>,
      );
    case "firstaid":
      return badge(
        <g fill="#dc2626">
          <rect x={-1.5} y={-4.5} width={3} height={9} rx={0.8} />
          <rect x={-4.5} y={-1.5} width={9} height={3} rx={0.8} />
        </g>,
      );
  }
}

/**
 * OSM 矢量雪道图：雪道按难度着色并沿线标注名称；缆车带类型图标与站点；
 * POI 图标层（山峰/餐饮/停车等）；指北针 + 比例尺。
 * openTrailNames 预留：传入后开放雪道保持彩色，未开放变灰。
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
    const H = Math.max(360, Math.min(800, (W * spanY) / spanX));
    const pad = 0.055;
    const px = (lng: number) => (((lng - minLng) * cosLat) / spanX) * W * (1 - 2 * pad) + W * pad;
    const py = (lat: number) => ((maxLat - lat) / spanY) * H * (1 - 2 * pad) + H * pad;
    const d = (pts: [number, number][]) =>
      pts.map(([lng, lat], i) => `${i === 0 ? "M" : "L"}${px(lng).toFixed(1)} ${py(lat).toFixed(1)}`).join("");
    const mid = (pts: [number, number][]) => {
      const [lng, lat] = pts[Math.floor(pts.length / 2)];
      return { x: px(lng), y: py(lat) };
    };
    const pt = (p: [number, number]) => ({ x: px(p[0]), y: py(p[1]) });
    // 折线在 viewBox 中的长度（判断是否放得下名称标注）
    const len = (pts: [number, number][]) => {
      let s = 0;
      for (let i = 1; i < pts.length; i++) {
        const a = pt(pts[i - 1]), b = pt(pts[i]);
        s += Math.hypot(b.x - a.x, b.y - a.y);
      }
      return s;
    };
    // 比例尺：换算 1km 对应的 viewBox 单位
    const kmPerSpanX = spanX * 111.32;
    const unitsPerKm = (W * (1 - 2 * pad)) / kmPerSpanX;
    const scaleOptions = [0.1, 0.2, 0.25, 0.5, 1, 2];
    const scaleKm =
      scaleOptions.find((k) => k * unitsPerKm >= 90 && k * unitsPerKm <= 220) ??
      scaleOptions[scaleOptions.length - 1];
    return { H, d, mid, pt, len, scaleUnits: scaleKm * unitsPerKm, scaleKm };
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
  const pois = geo.pois ?? [];
  const poiKindsPresent = [...new Set(pois.map((p) => p.kind))];

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
            // 名称标注沿线排版；线走向朝左时反转点序避免文字倒置
            const first = view.pt(t.points[0]);
            const last = view.pt(t.points[t.points.length - 1]);
            const labelPts = last.x >= first.x ? t.points : [...t.points].reverse();
            const showLabel = t.name && view.len(t.points) > 95;
            return (
              <g key={`trail-${t.id}`}>
                <path
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
                {showLabel && (
                  <>
                    <path id={`lp-${slug}-${t.id}`} d={view.d(labelPts)} fill="none" stroke="none" />
                    <text
                      fontSize={11}
                      fill="#334155"
                      stroke="white"
                      strokeWidth={3}
                      paintOrder="stroke"
                      className="pointer-events-none select-none dark:fill-slate-200 dark:stroke-slate-900"
                    >
                      <textPath href={`#lp-${slug}-${t.id}`} startOffset="50%" textAnchor="middle">
                        {t.name}
                      </textPath>
                    </text>
                  </>
                )}
              </g>
            );
          })}
          {/* 缆车 */}
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
          {/* POI */}
          {pois.map((p, i) => {
            const { x, y } = view.pt(p.point);
            return (
              <g
                key={`poi-${i}`}
                className="cursor-pointer"
                onMouseEnter={() => setHover(`p${i}`)}
                onMouseLeave={() => setHover(null)}
              >
                <PoiIcon x={x} y={y} kind={p.kind} />
                {p.kind === "peak" && (
                  <text
                    x={x}
                    y={y - 11}
                    textAnchor="middle"
                    fontSize={10.5}
                    fill="#334155"
                    stroke="white"
                    strokeWidth={3}
                    paintOrder="stroke"
                    className="pointer-events-none select-none dark:fill-slate-200 dark:stroke-slate-900"
                  >
                    {(p.name ?? "山峰") + (p.ele ? ` ${Math.round(p.ele)}m` : "")}
                  </text>
                )}
                <title>{`${POI_LABEL[p.kind]}${p.name ? ` · ${p.name}` : ""}${p.ele ? ` · 海拔${Math.round(p.ele)}m` : ""}`}</title>
              </g>
            );
          })}
          {/* 指北针 */}
          <g transform={`translate(${W - 42} 44)`} opacity={0.9}>
            <circle r={16} fill="white" stroke="#cbd5e1" strokeWidth={1.2} />
            <path d="M0 -11 L4 5 L0 2 L-4 5 Z" fill="#334155" />
            <text y={13.5} textAnchor="middle" fontSize={8.5} fill="#64748b">
              北
            </text>
          </g>
          {/* 比例尺 */}
          <g transform={`translate(24 ${view.H - 22})`}>
            <rect x={-8} y={-14} width={view.scaleUnits + 16 + 42} height={24} rx={6} fill="white" opacity={0.75} />
            <line x1={0} y1={0} x2={view.scaleUnits} y2={0} stroke="#475569" strokeWidth={2} />
            <line x1={0} y1={-4} x2={0} y2={4} stroke="#475569" strokeWidth={2} />
            <line x1={view.scaleUnits} y1={-4} x2={view.scaleUnits} y2={4} stroke="#475569" strokeWidth={2} />
            <text x={view.scaleUnits + 8} y={3.5} fontSize={10.5} fill="#475569">
              {view.scaleKm < 1 ? `${view.scaleKm * 1000}m` : `${view.scaleKm}km`}
            </text>
          </g>
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
              if (hover.startsWith("l")) {
                const l = geo.lifts.find((x) => `l${x.id}` === hover);
                if (!l) return null;
                return `${LIFT_KIND_LABEL[liftKind(l.type)]}${l.name ? ` · ${l.name}` : ""}`;
              }
              const p = pois[Number(hover.slice(1))];
              if (!p) return null;
              return `${POI_LABEL[p.kind]}${p.name ? ` · ${p.name}` : ""}${p.ele ? ` · 海拔${Math.round(p.ele)}m` : ""}`;
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
        {poiKindsPresent.map((k) => (
          <span key={k} className="flex items-center gap-1.5">
            <svg width="18" height="18" viewBox="-9 -9 18 18">
              <PoiIcon x={0} y={0} kind={k} />
            </svg>
            {POI_LABEL[k]}
          </span>
        ))}
        <span className="ml-auto text-slate-300 dark:text-slate-500">
          {geo.trails.length} 条雪道 · {geo.lifts.length} 条缆车 · © OpenStreetMap
        </span>
      </div>
    </div>
  );
}
