/** 天气现象文本 → 展示 emoji（粗粒度映射，够 MVP 用） */
export function weatherEmoji(text: string | null | undefined): string {
  if (!text) return "🌤️";
  if (text.includes("雪")) return "🌨️";
  if (text.includes("雨")) return "🌧️";
  if (text.includes("雷")) return "⛈️";
  if (text.includes("雾") || text.includes("霾")) return "🌫️";
  if (text.includes("晴")) return "☀️";
  if (text.includes("云") || text.includes("阴")) return "☁️";
  return "🌤️";
}
