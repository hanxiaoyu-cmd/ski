import { z } from "zod";

export const LODGING_TYPES = ["HOTEL", "HOMESTAY", "APARTMENT"] as const;
export type LodgingType = (typeof LODGING_TYPES)[number];

export const LODGING_TYPE_LABELS: Record<LodgingType, string> = {
  HOTEL: "酒店",
  HOMESTAY: "民宿",
  APARTMENT: "公寓",
};

export const lodgingSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.enum(LODGING_TYPES),
  distanceToResortM: z.number().nullable(),
  isSkiInOut: z.boolean(),
  address: z.string().nullable(),
  /** 各平台跳转链接：{ ctrip?: string, meituan?: string, official?: string } */
  links: z.record(z.string(), z.string()),
  /** 最近一次采集/录入的价格区间（分）；无数据为 null */
  priceMinCents: z.number().nullable(),
  priceMaxCents: z.number().nullable(),
  priceUpdatedAt: z.string().nullable(),
});
export type LodgingInfo = z.infer<typeof lodgingSchema>;
