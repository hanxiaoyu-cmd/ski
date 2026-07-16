# ADR 0001：技术栈选型

日期：2026-07-16 ｜ 状态：已采纳

## 决策

- **Monorepo**：pnpm workspaces + Turborepo
- **后端**：NestJS（Fastify 适配器），同一代码库两个入口——`main.api.ts`（HTTP）与 `main.worker.ts`（定时采集），采集故障不影响 API
- **数据库**：PostgreSQL 16 + Prisma；时序快照只增不改，原始响应存 JSONB
- **缓存/队列**：Redis 7（Cache-Aside；Phase 4 引入 BullMQ 做采集队列）
- **Web**：Next.js App Router（SEO 需要 SSR/ISR）
- **小程序**：Taro 4（React），与 Web 共享 `@ski/shared` 与 `@ski/api-client`
- **爬虫**：Node（Playwright + cheerio），**不引入 Python**——单一工具链，采集结果直接复用 Prisma 模型与 zod 校验
- **天气数据**：和风天气为主源（免费 5 万次/月），`WeatherProvider` 接口抽象，可切换彩云等

## 关键理由

1. 双端（Web + 小程序）共享类型与 API client 是 TypeScript 全栈的最大收益。
2. 小程序硬性要求 HTTPS + ICP 备案域名 → 部署必须境内，行政流程需与开发并行。
3. 18 家雪场 × 每小时实况 + 每 3 小时预报 ≈ 2 万次/月，在和风免费额度内。
