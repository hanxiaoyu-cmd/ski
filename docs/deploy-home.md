# 家用电脑自托管部署（xiaoyuu.me + Cloudflare Tunnel）

把整套服务跑在自己的 Windows 电脑上，通过 Cloudflare Tunnel 对外提供 https://xiaoyuu.me 访问。
**不需要公网 IP、不需要路由器开端口**；电脑关机/断网期间网站不可访问。

## 原理

```
访客 ──https──▶ Cloudflare 边缘节点 ──tunnel──▶ 你电脑上的 cloudflared 容器 ──▶ web:3001
                （xiaoyuu.me 解析到 CF）        （出站连接，无需开端口）
```

## 一次性配置步骤

### 1. 把域名 DNS 托管到 Cloudflare（免费）

1. 注册 https://dash.cloudflare.com 账号 → Add a domain → 输入 `xiaoyuu.me`，选 Free 计划
2. Cloudflare 会给你两个 Nameserver（形如 `xxx.ns.cloudflare.com`）
3. 到阿里云控制台 → 域名 → xiaoyuu.me → 管理 → **DNS 修改/修改 DNS 服务器**，
   把默认的阿里云 NS 换成 Cloudflare 给的两个
4. 等待生效（几分钟到几小时），Cloudflare 站点状态变为 Active

### 2. 创建 Tunnel

1. Cloudflare 控制台 → Zero Trust → Networks → Tunnels → Create a tunnel（Cloudflared 类型）
2. 名字随意（如 `ski-home`），创建后会显示一串 **token**（`eyJ...` 很长）
3. 把 token 填到项目根目录 `.env` 的 `CLOUDFLARE_TUNNEL_TOKEN=""` 里
4. 在 Tunnel 的 **Public Hostname** 页添加：
   - Subdomain：留空，Domain：`xiaoyuu.me`，Path：留空
   - Service：Type `HTTP`，URL `web:3001`（cloudflared 与 web 在同一 compose 网络）
5. 可选：再加一条 `www.xiaoyuu.me` 指向同一个 Service

### 3. 启动生产栈

```powershell
cd C:\Users\asus\Desktop\ski
docker compose -f docker-compose.prod.yml --profile tunnel up -d --build
```

首次启动会自动建表（migrate deploy）并写入种子数据，worker 随后开始采集天气。

### 4. 验证

- 本机：http://localhost:8301 （web 直连）、http://localhost:8300/api/v1/health （API）
- 外网：https://xiaoyuu.me （手机关掉 WiFi 用流量测试更准）

## 日常运维

| 操作 | 命令 |
|---|---|
| 查看状态 | `docker compose -f docker-compose.prod.yml ps` |
| 看日志 | `docker compose -f docker-compose.prod.yml logs -f web`（或 api/worker/cloudflared） |
| 更新代码后重新部署 | `git pull` 后 `docker compose -f docker-compose.prod.yml --profile tunnel up -d --build` |
| 全部停止 | `docker compose -f docker-compose.prod.yml --profile tunnel down`（数据卷保留） |

- 生产库与开发库完全隔离（独立容器和数据卷，不映射 5432 端口）
- 电脑重启后 Docker Desktop 自启时容器会自动拉起（restart: unless-stopped）；
  建议在 Docker Desktop 设置里勾选 "Start Docker Desktop when you sign in"

## 已知限制（迁移云服务器前请知晓）

1. **xiaoyuu.me 无法 ICP 备案**（.me 不在工信部认可后缀名单）。当前 Cloudflare 境外接入方式不需要备案，
   但将来上微信小程序必须使用「HTTPS + 已备案域名」，届时需另购 .com/.cn 域名并迁移到国内云服务器。
2. 国内访问 Cloudflare 免费节点速度一般（延迟较高），雪季正式运营前建议迁移到国内云 + 备案。
3. 网站可用性 = 你电脑的开机时间。
4. 迁移很简单：同一份 `docker-compose.prod.yml` 在任何 Linux 云服务器上原样可用，
   届时把 cloudflared 换成 Caddy/Nginx + 备案域名即可。
