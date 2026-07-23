// 选板尺寸建议：纯前端估算，仅供参考（非精确公式，实际以个人风格与具体板型为准）。

import type { BoardCategory } from "../board-enums";

export interface SizeInput {
  heightCm: number;
  weightKg?: number;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  category: BoardCategory;
  style?: "freestyle" | "jib" | "all_mountain" | "powder"; // 单板风格偏好
}

export interface SizeSuggestion {
  minCm: number;
  maxCm: number;
  note: string;
}

/**
 * 单板：经典估算以身高为基准（约身高 -15~-17cm 到下巴/鼻尖之间），
 * 再按体重（偏重加长、偏轻减短）、水平（初学减短更易操控）、风格（平花偏短、粉雪偏长）微调。
 * 双板：全能板常见约 身高 -10cm 上下，初学更短、进阶更长。
 */
export function suggestSize(input: SizeInput): SizeSuggestion {
  const { heightCm, weightKg, level, category, style } = input;

  if (category === "SKI") {
    let base = heightCm - 10;
    if (level === "beginner") base -= 6;
    else if (level === "expert") base += 4;
    const min = Math.round(base - 4);
    const max = Math.round(base + 4);
    return {
      minCm: min,
      maxCm: max,
      note: "双板全能板参考：初学者偏短更易转向，进阶/高速偏长更稳定；粉雪、大回转可再加长。",
    };
  }

  // 单板
  let base = heightCm - 16;
  if (level === "beginner") base -= 3;
  else if (level === "expert") base += 1;
  if (style === "freestyle" || style === "jib") base -= 3;
  else if (style === "powder") base += 3;

  // 体重修正：以身高对应的“标准体重”粗略比较
  if (weightKg) {
    const standard = heightCm - 110; // 极粗略基准
    if (weightKg - standard >= 10) base += 3;
    else if (standard - weightKg >= 10) base -= 3;
  }

  const min = Math.round(base - 2);
  const max = Math.round(base + 3);
  return {
    minCm: min,
    maxCm: max,
    note: "单板参考：板尾立起约在下巴到鼻尖之间；偏重或追求稳定选长，平花/初学选短更好操控。",
  };
}
