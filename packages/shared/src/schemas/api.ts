import { z } from "zod";

/** 后端统一响应包裹：{ code, data, message }，code 0 表示成功 */
export function apiResponseSchema<T extends z.ZodTypeAny>(data: T) {
  return z.object({
    code: z.number(),
    message: z.string(),
    data,
  });
}

export type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};
