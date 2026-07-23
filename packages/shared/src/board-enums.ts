// 雪板装备相关枚举 + 中文 label 映射。与 prisma schema 的 Board 字段取值保持一致。

export const BOARD_CATEGORIES = ["SNOWBOARD", "SKI"] as const;
export type BoardCategory = (typeof BOARD_CATEGORIES)[number];
export const BOARD_CATEGORY_LABELS: Record<BoardCategory, string> = {
  SNOWBOARD: "单板",
  SKI: "双板",
};

// 用途（单板/双板取值合并，前端按 category 过滤展示）
export const BOARD_TYPE_LABELS: Record<string, string> = {
  all_mountain: "全能",
  freestyle: "自由式",
  powder: "粉雪",
  carving: "大回转",
  jib: "平花",
  splitboard: "分体板",
  park: "公园",
  piste: "压雪道",
  touring: "登山",
};

export const CAMBER_LABELS: Record<string, string> = {
  camber: "正 Camber",
  rocker: "反 Camber",
  hybrid: "混合板型",
  flat: "平板型",
  camrock: "Camber+Rocker",
};

export const SHAPE_LABELS: Record<string, string> = {
  directional: "定向",
  twin: "对称",
  directional_twin: "定向对称",
  tapered: "收尾定向",
};

export const BOARD_LEVELS = ["beginner", "intermediate", "advanced", "expert"] as const;
export type BoardLevel = (typeof BOARD_LEVELS)[number];
export const BOARD_LEVEL_LABELS: Record<string, string> = {
  beginner: "初级",
  intermediate: "中级",
  advanced: "高级",
  expert: "专家",
};

export const BOARD_GENDER_LABELS: Record<string, string> = {
  men: "男款",
  women: "女款",
  unisex: "中性",
};

/** 硬度 1-10 → 文字档位 */
export function flexLabel(flex: number): string {
  if (flex <= 3) return "软";
  if (flex <= 5) return "中软";
  if (flex <= 7) return "适中";
  if (flex <= 8) return "偏硬";
  return "硬";
}
