// 与 packages/db/prisma/schema.prisma 中的枚举保持一致。
// 前端（Web/小程序）不依赖 Prisma，只依赖这里的字符串联合类型。

export const TRAIL_DIFFICULTIES = ["GREEN", "BLUE", "RED", "BLACK"] as const;
export type TrailDifficulty = (typeof TRAIL_DIFFICULTIES)[number];

export const TICKET_TYPES = ["DAY", "HALF_DAY", "NIGHT", "MULTI_DAY", "SEASON", "HOURLY"] as const;
export type TicketType = (typeof TICKET_TYPES)[number];

export const DAY_TYPES = ["WEEKDAY", "WEEKEND", "HOLIDAY", "ALL"] as const;
export type DayType = (typeof DAY_TYPES)[number];

export const CHANNELS = ["OFFICIAL", "MEITUAN", "CTRIP", "QUNAR", "DOUYIN", "OTHER"] as const;
export type Channel = (typeof CHANNELS)[number];

export const REPORT_SOURCES = ["OFFICIAL", "MANUAL", "CROWDSOURCE", "ESTIMATED"] as const;
export type ReportSource = (typeof REPORT_SOURCES)[number];

export const SNOW_TYPES = ["POWDER", "GROOMED", "ICY", "SLUSH"] as const;
export type SnowType = (typeof SNOW_TYPES)[number];

export const TICKET_TYPE_LABELS: Record<TicketType, string> = {
  DAY: "全天票",
  HALF_DAY: "半天票",
  NIGHT: "夜场票",
  MULTI_DAY: "多日票",
  SEASON: "季卡",
  HOURLY: "计时票",
};

export const DAY_TYPE_LABELS: Record<DayType, string> = {
  WEEKDAY: "平日",
  WEEKEND: "周末",
  HOLIDAY: "节假日",
  ALL: "通用",
};

export const TRAIL_DIFFICULTY_LABELS: Record<TrailDifficulty, string> = {
  GREEN: "初级",
  BLUE: "中级",
  RED: "高级",
  BLACK: "专家",
};

export const SNOW_TYPE_LABELS: Record<SnowType, string> = {
  POWDER: "粉雪",
  GROOMED: "压雪",
  ICY: "冰面",
  SLUSH: "融雪",
};
