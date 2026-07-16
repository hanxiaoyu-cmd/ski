import { z } from "zod";
import {
  resortSummarySchema,
  resortDetailSchema,
  resortWeatherSchema,
  ticketProductSchema,
  type ResortSummary,
  type ResortDetail,
  type ResortWeather,
  type TicketProduct,
} from "@ski/shared";

/**
 * 传输层由调用方注入：
 *   Web (Next.js)  → globalThis.fetch
 *   小程序 (Taro)   → Taro.request 适配
 */
export interface HttpAdapter {
  (options: { url: string; method: "GET" | "POST"; body?: unknown }): Promise<{
    status: number;
    data: unknown;
  }>;
}

export interface ApiClientOptions {
  baseUrl: string;
  request: HttpAdapter;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const envelopeSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: z.unknown(),
});

async function call<T extends z.ZodTypeAny>(
  opts: ApiClientOptions,
  path: string,
  dataSchema: T,
): Promise<z.infer<T>> {
  const { status, data } = await opts.request({
    url: `${opts.baseUrl}${path}`,
    method: "GET",
  });
  if (status < 200 || status >= 300) {
    throw new ApiError(`HTTP ${status} for ${path}`, status);
  }
  const envelope = envelopeSchema.safeParse(data);
  if (!envelope.success) {
    throw new ApiError(`Unexpected response shape for ${path}: ${envelope.error.message}`, status);
  }
  if (envelope.data.code !== 0) {
    throw new ApiError(envelope.data.message, status, envelope.data.code);
  }
  const parsed = dataSchema.safeParse(envelope.data.data);
  if (!parsed.success) {
    throw new ApiError(`Unexpected data shape for ${path}: ${parsed.error.message}`, status);
  }
  return parsed.data;
}

export function createApiClient(opts: ApiClientOptions) {
  return {
    listResorts(province?: string): Promise<ResortSummary[]> {
      const qs = province ? `?province=${encodeURIComponent(province)}` : "";
      return call(opts, `/api/v1/resorts${qs}`, z.array(resortSummarySchema));
    },
    getResort(slug: string): Promise<ResortDetail> {
      return call(opts, `/api/v1/resorts/${slug}`, resortDetailSchema);
    },
    getResortWeather(slug: string): Promise<ResortWeather> {
      return call(opts, `/api/v1/resorts/${slug}/weather`, resortWeatherSchema);
    },
    getResortTickets(slug: string): Promise<TicketProduct[]> {
      return call(opts, `/api/v1/resorts/${slug}/tickets`, z.array(ticketProductSchema));
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
