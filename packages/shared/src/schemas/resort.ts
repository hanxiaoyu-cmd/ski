import { z } from "zod";
import { weatherNowSchema } from "./weather";

export const resortSummarySchema = z.object({
  slug: z.string(),
  name: z.string(),
  province: z.string(),
  city: z.string(),
  lat: z.number(),
  lng: z.number(),
  altitudeBaseM: z.number().nullable(),
  altitudeTopM: z.number().nullable(),
  totalTrailKm: z.number().nullable(),
  seasonOpen: z.string().nullable(),
  seasonClose: z.string().nullable(),
  coverImageUrl: z.string().nullable(),
  /** 列表页聚合的当前天气（可能尚未采集到） */
  weatherNow: weatherNowSchema.nullable().optional(),
});
export type ResortSummary = z.infer<typeof resortSummarySchema>;

export const trailStatsSchema = z.object({
  total: z.number(),
  byDifficulty: z.record(z.string(), z.number()),
});

export const transportItemSchema = z.object({
  mode: z.enum(["train", "plane", "car", "bus"]),
  title: z.string(),
  detail: z.string(),
});
export type TransportItem = z.infer<typeof transportItemSchema>;

export const resortDetailSchema = resortSummarySchema.extend({
  officialWebsite: z.string().nullable(),
  officialWechatName: z.string().nullable(),
  phone: z.string().nullable(),
  intro: z.string().nullable(),
  trailMapUrl: z.string().nullable(),
  transport: z.array(transportItemSchema).nullable(),
  trailStats: trailStatsSchema.optional(),
});
export type ResortDetail = z.infer<typeof resortDetailSchema>;
