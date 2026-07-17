# 云服务器部署（阿里云香港/首尔等境外地域 + xiaoyuu.me）

境外地域**不需要 ICP 备案**，域名直接可用。以下步骤在香港、首尔或任何境外 Linux 服务器上通用。

## 0. 购买清单

- 地域：香港（内地访问最快）或首尔（看促销价格）
- 规格：最低 2核2G，推荐 2核4G；系统盘 ≥ 30GB
- 镜像：**Ubuntu 24.04**
- 安全组/防火墙：放行 **22（SSH）、80、443** 入方向端口

## 1. 域名解析（阿里云控制台）

域名 → xiaoyuu.me → 解析设置，添加两条 A 记录：

| 主机记录 | 类型 | 记录值 |
|---|---|---|
| @ | A | 服务器公网 IP |
| www | A | 服务器公网 IP |

## 2. 服务器初始化（SSH 登录后执行）

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 获取代码（私有仓库，先在服务器生成 SSH 密钥并添加到 GitHub）
ssh-keygen -t ed25519 -N "" -f ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub
# 把上面输出的公钥添加到 GitHub: Settings -> SSH and GPG keys -> New SSH key
git clone git@github.com:hanxiaoyu-cmd/ski.git && cd ski
```

## 3. 配置环境变量

```bash
cp .env.example .env
nano .env   # 填 QWEATHER_API_KEY / QWEATHER_API_HOST / POSTGRES_PROD_PASSWORD（自定义强密码）
```

境外服务器访问 npmmirror 可能不如 npmjs 快，可选：把 `Dockerfile` 里的
`pnpm config set registry ...` 那行删掉再构建。

## 4. 启动（Caddy 会自动申请 HTTPS 证书）

```bash
docker compose -f docker-compose.prod.yml --profile caddy up -d --build
```

首次构建约几分钟。完成后访问 https://xiaoyuu.me 即可（证书签发需 DNS 已生效）。

## 5. 日常运维

```bash
# 查看状态 / 日志
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f web

# 数据库备份（建议每周跑一次，或加进 crontab）
docker exec ski-prod-postgres pg_dump -U ski ski | gzip > backup_$(date +%F).sql.gz
```

**更新部署**：不要在服务器上执行 `--build`——小规格机器的构建缓存和中间层会打爆磁盘。
统一在本地 Windows 运行 `.\scripts\deploy.ps1`：本地构建镜像 → ssh 压缩流式传输 →
服务器 `docker load` → `up -d`（自动识别镜像变化重建容器）→ `docker image prune -f` 清理旧层。

若服务器磁盘已被历史构建占满，一次性清理：
```bash
docker system prune -af --volumes=false && docker builder prune -af
```

## 与家用电脑方案的关系

同一份 `docker-compose.prod.yml`，家里用 `--profile tunnel`（Cloudflare），云上用 `--profile caddy`。
两边可以共存（比如云上是正式站，家里是测试站），互不影响。
将来迁移国内服务器+备案域名时，只需改 `deploy/Caddyfile` 里的域名和 web 服务的 `SITE_URL`。
