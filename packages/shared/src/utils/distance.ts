/**
 * 距离展示：步行按 80m/min（约 4.8km/h），超过 2.5km 改按车程 500m/min（约 30km/h）估算。
 * 均为直线距离推算，仅供参考。
 */

const WALK_M_PER_MIN = 80;
const DRIVE_M_PER_MIN = 500;
const WALK_MAX_M = 2500;

export function walkingMinutes(distanceM: number): number {
  return Math.max(1, Math.ceil(distanceM / WALK_M_PER_MIN));
}

export function formatStraightDistance(distanceM: number): string {
  return distanceM < 1000 ? `${distanceM}m` : `${(distanceM / 1000).toFixed(1)}km`;
}

/** 例："步行约6分钟 · 直线500m" / "车程约6分钟 · 直线3.0km" / "雪场内" */
export function distanceLabel(distanceM: number | null): string | null {
  if (distanceM === null) return null;
  if (distanceM === 0) return "雪场内";
  if (distanceM <= WALK_MAX_M) {
    return `步行约${walkingMinutes(distanceM)}分钟 · 直线${formatStraightDistance(distanceM)}`;
  }
  const driveMin = Math.max(1, Math.ceil(distanceM / DRIVE_M_PER_MIN));
  return `车程约${driveMin}分钟 · 直线${formatStraightDistance(distanceM)}`;
}
