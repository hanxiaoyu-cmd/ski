# 一键部署到首尔服务器 (xiaoyuu.me)
# 流程：本地构建镜像 → ssh -C 压缩流式传输 → 服务器 docker load → up -d
# 服务器上不做任何构建（2核2G/40G 小机器，构建缓存会打爆磁盘）
# 用法: .\scripts\deploy.ps1   （在仓库根目录执行；需本地 Docker Desktop 运行中）

$ErrorActionPreference = "Stop"
$SERVER = "8.213.149.158"
$KEY = "$env:USERPROFILE\.ssh\ski_seoul_key"
$SSH_OPTS = "-i", $KEY, "-o", "ConnectTimeout=90", "-o", "ServerAliveInterval=15"

docker info *> $null
if ($LASTEXITCODE -ne 0) { Write-Host "本地 Docker Desktop 未运行，先启动它" -ForegroundColor Red; exit 1 }

Write-Host "[1/4] 本地构建镜像 ski-app ..."
docker build -t ski-app .
if ($LASTEXITCODE -ne 0) { Write-Host "本地构建失败" -ForegroundColor Red; exit 1 }

Write-Host "[2/4] 流式传输镜像到服务器（ssh -C 压缩，视上行带宽约 3-10 分钟）..."
# 二进制管道必须走 cmd，PowerShell 5.1 的管道会破坏二进制流
cmd /c "docker save ski-app | ssh -C -i $KEY -o ConnectTimeout=90 -o ServerAliveInterval=15 root@$SERVER ""docker load"""
if ($LASTEXITCODE -ne 0) {
    Write-Host "镜像传输失败。若 SSH 连不上：代理 TUN 需对 $SERVER 直连或临时关闭。" -ForegroundColor Yellow
    exit 1
}

Write-Host "[3/4] 同步配置并重启服务..."
ssh @SSH_OPTS "root@$SERVER" "mkdir -p /opt/ski/deploy"
scp @SSH_OPTS docker-compose.prod.yml .env "root@${SERVER}:/opt/ski/"
scp @SSH_OPTS deploy/Caddyfile "root@${SERVER}:/opt/ski/deploy/"
if ($LASTEXITCODE -ne 0) { Write-Host "配置上传失败" -ForegroundColor Red; exit 1 }
# up -d 检测到镜像变化会自动重建容器；随后清理被替换下来的旧镜像层，防止磁盘累积
ssh @SSH_OPTS "root@$SERVER" "cd /opt/ski && docker compose -f docker-compose.prod.yml --profile caddy up -d 2>&1 | tail -3 && docker image prune -f | tail -1 && echo '磁盘: ' && df -h / | tail -1"
if ($LASTEXITCODE -ne 0) { Write-Host "远程启动失败" -ForegroundColor Red; exit 1 }

Write-Host "[4/4] 验证..."
Start-Sleep 10
$health = ssh @SSH_OPTS "root@$SERVER" "curl -s -o /dev/null -w '%{http_code}' --max-time 20 https://xiaoyuu.me/"
if ($health -eq "200") {
    Write-Host "部署成功: https://xiaoyuu.me 返回 200" -ForegroundColor Green
} else {
    Write-Host "网站返回 $health，排查: ssh -i $KEY root@$SERVER 'cd /opt/ski && docker compose -f docker-compose.prod.yml ps'" -ForegroundColor Red
    exit 1
}
