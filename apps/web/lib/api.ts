import { createApiClient } from "@ski/api-client";

const API_URL = process.env.API_URL ?? "http://localhost:3000";

/** 服务端（RSC）专用 client；fetch 层做 5 分钟数据缓存 */
export const api = createApiClient({
  baseUrl: API_URL,
  request: async ({ url, method, body }) => {
    const res = await fetch(url, {
      method,
      headers: body ? { "content-type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      next: { revalidate: 300 },
    });
    return { status: res.status, data: await res.json().catch(() => null) };
  },
});
