/** 拥挤度等级 1（空旷）- 5（爆满）的展示文案与配色，双端共用 */

export const CROWD_LEVELS = [1, 2, 3, 4, 5] as const;
export type CrowdLevel = (typeof CROWD_LEVELS)[number];

export const CROWD_LEVEL_LABELS: Record<CrowdLevel, string> = {
  1: "空旷",
  2: "较少",
  3: "适中",
  4: "较多",
  5: "爆满",
};

export function crowdLevelLabel(level: number): string {
  const clamped = Math.min(5, Math.max(1, Math.round(level))) as CrowdLevel;
  return CROWD_LEVEL_LABELS[clamped];
}
