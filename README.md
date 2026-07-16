# 中国滑雪资讯聚合平台

收集中国主要滑雪场的**天气/雪况、人流、票价、住宿**信息。Web 网站 + 微信小程序双端，共享同一后端 API。

## 结构

```
apps/api          NestJS 后端（main.api.ts = HTTP API，main.worker.ts = 定时采集）
apps/web          Next.js 网站（Phase 2）
apps/miniapp      Taro 微信小程序（Phase 3）
packages/db       Prisma schema + PrismaClient
packages/shared   zod schemas / 枚举 / 双端共用工具
packages/api-client  注入式 API client（Web 用 fetch，小程序用 Taro.request）
data/seeds        种子数据（雪场基础信息为人工整理初稿，坐标待逐一核实）
```

## 本地开发

```bash
# 1. 起数据库（需 Docker Desktop）
docker compose -f docker-compose.dev.yml up -d

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
copy .env.example .env    # 天气采集需填 QWEATHER_API_KEY / QWEATHER_API_HOST

# 4. 建表 + 种子数据
pnpm db:migrate
pnpm db:seed

# 5. 启动 API（http://localhost:3000/api/v1/health）
pnpm dev:api

# 6. 启动采集 worker（可选，需和风天气配置）
pnpm --filter @ski/api build && pnpm --filter @ski/api start:worker
```

## 主要接口

| 路径 | 说明 |
|---|---|
| `GET /api/v1/health` | 健康检查 |
| `GET /api/v1/resorts?province=河北` | 雪场列表（含最新天气聚合） |
| `GET /api/v1/resorts/:slug` | 雪场详情 |
| `GET /api/v1/resorts/:slug/weather` | 实况 + 7 日预报 |
| `GET /api/v1/resorts/:slug/tickets` | 票价 |

## 种子数据说明

- `data/seeds/resorts.json`：18 家首批雪场（崇礼 6、东北 4、新疆 3、北京 4、四川 1）。**坐标/海拔为初稿近似值**，Phase 1 需逐一核实。
- `data/seeds/tickets-manual.json`：初始票价，人工整理后放入即可被 `pnpm db:seed` 读取（文件不存在则跳过）。格式见 `packages/db/prisma/seed.ts` 的 `TicketSeed`。

## 部署

家用电脑自托管（xiaoyuu.me + Cloudflare Tunnel）：见 [docs/deploy-home.md](docs/deploy-home.md)。

```powershell
docker compose -f docker-compose.prod.yml --profile tunnel up -d --build
```

## 路线图

Phase 0 脚手架（当前）→ 1 天气+核心 API → 2 Web → 3 小程序 → 4 票价/住宿采集 → 5 人流+用户。详见 `docs/`。

行政前置（与开发并行，越早越好）：域名注册 → ICP 备案（2-4 周）→ 企业主体小程序注册 → 和风天气开发者认证。
