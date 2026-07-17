import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Cloudy,
  Haze,
  Sun,
  Wind,
  type LucideIcon,
} from "lucide-react";

/** 天气现象文本 → lucide 图标 + 语义配色（和风返回的中文现象名） */
function pick(text: string | null | undefined): { Icon: LucideIcon; color: string } {
  const t = text ?? "";
  if (t.includes("雷")) return { Icon: CloudLightning, color: "text-amber-500" };
  if (t.includes("雪")) return { Icon: CloudSnow, color: "text-sky-500" };
  if (t.includes("雨")) {
    return t.includes("小雨") || t.includes("毛毛")
      ? { Icon: CloudDrizzle, color: "text-blue-400" }
      : { Icon: CloudRain, color: "text-blue-500" };
  }
  if (t.includes("雾")) return { Icon: CloudFog, color: "text-slate-400" };
  if (t.includes("霾") || t.includes("沙") || t.includes("尘")) return { Icon: Haze, color: "text-stone-400" };
  if (t.includes("风")) return { Icon: Wind, color: "text-teal-500" };
  if (t.includes("多云") || (t.includes("晴") && t.includes("云"))) return { Icon: CloudSun, color: "text-amber-400" };
  if (t.includes("晴")) return { Icon: Sun, color: "text-amber-500" };
  if (t.includes("阴")) return { Icon: Cloudy, color: "text-slate-400" };
  return { Icon: Cloud, color: "text-slate-400" };
}

export function WeatherGlyph({
  text,
  size = 20,
  className = "",
}: {
  text: string | null | undefined;
  size?: number;
  className?: string;
}) {
  const { Icon, color } = pick(text);
  return <Icon size={size} className={`${color} ${className}`} aria-label={text ?? "天气"} strokeWidth={1.8} />;
}
