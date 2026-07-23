"use client";

import { useState } from "react";
import { Ruler } from "lucide-react";
import { suggestSize, type BoardCategory } from "@ski/shared";

export function BoardSizeGuide({ category }: { category: BoardCategory }) {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced" | "expert">(
    "intermediate",
  );

  const h = Number(height);
  const w = Number(weight);
  const result =
    h >= 130 && h <= 210
      ? suggestSize({ heightCm: h, weightKg: w > 0 ? w : undefined, level, category })
      : null;

  return (
    <div className="rounded-2xl border border-slate-100 p-5 dark:border-slate-800/80">
      <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
        <Ruler size={16} className="text-sky-600 dark:text-sky-400" />
        选板长度参考
      </h3>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="text-xs text-slate-500 dark:text-slate-400">
          身高 (cm)
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="如 172"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </label>
        <label className="text-xs text-slate-500 dark:text-slate-400">
          体重 (kg，选填)
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="如 65"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </label>
        <label className="text-xs text-slate-500 dark:text-slate-400">
          水平
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as typeof level)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="beginner">初级</option>
            <option value="intermediate">中级</option>
            <option value="advanced">高级</option>
            <option value="expert">专家</option>
          </select>
        </label>
      </div>

      {result ? (
        <div className="mt-4 rounded-xl bg-sky-50 px-4 py-3 dark:bg-sky-950/50">
          <p className="text-sm">
            建议长度约{" "}
            <span className="text-lg font-bold text-sky-700 dark:text-sky-300">
              {result.minCm}–{result.maxCm} cm
            </span>
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            {result.note}
          </p>
        </div>
      ) : (
        <p className="mt-4 text-xs text-slate-400">输入身高（130–210cm）即可获得长度建议</p>
      )}
    </div>
  );
}
