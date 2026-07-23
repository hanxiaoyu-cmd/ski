import { z } from "zod";
import { BOARD_CATEGORIES } from "../board-enums";

export const boardSummarySchema = z.object({
  slug: z.string(),
  brand: z.string(),
  name: z.string(),
  category: z.enum(BOARD_CATEGORIES),
  boardType: z.string().nullable(),
  camber: z.string().nullable(),
  flex: z.number().nullable(),
  level: z.string().nullable(),
  gender: z.string().nullable(),
  year: z.number().nullable(),
  sizesCm: z.array(z.number()),
  priceCents: z.number().nullable(),
  priceFromCents: z.number().nullable(),
  coverImageUrl: z.string().nullable(),
  highlights: z.array(z.string()),
});
export type BoardSummary = z.infer<typeof boardSummarySchema>;

export const boardDetailSchema = boardSummarySchema.extend({
  shape: z.string().nullable(),
  intro: z.string().nullable(),
  officialUrl: z.string().nullable(),
  buyUrl: z.string().nullable(),
});
export type BoardDetail = z.infer<typeof boardDetailSchema>;

export const boardBrandSchema = z.object({
  brand: z.string(),
  count: z.number(),
});
export type BoardBrand = z.infer<typeof boardBrandSchema>;
