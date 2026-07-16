import type { MetadataRoute } from "next";
import { api } from "../lib/api";

const SITE_URL = process.env.SITE_URL ?? "http://localhost:3001";

// 构建时 API 可能未启动，改为请求时动态生成，保证雪场列表完整
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const resorts = await api.listResorts().catch(() => []);
  return [
    { url: SITE_URL, changeFrequency: "hourly", priority: 1 },
    ...resorts.map((r) => ({
      url: `${SITE_URL}/resorts/${r.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
