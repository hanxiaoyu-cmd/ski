# 一键部署到首尔服务器 (xiaoyuu.me)
# 用法: .\scripts\deploy.ps1   （在仓库根目录执行）
# 前提: 代理软件已对 8.213.149.158 设置直连规则（或临时关闭 TUN），否则 SSH 会被拦截

$ErrorActionPreference = "Stop"
$SERVER = "8.213.149.158"
$KEY = "$env:USERPROFILE\.ssh\ski_seoul_key"
$SSH_OPTS = "-i", $KEY, "-o", "ConnectTimeout=90"

Write-Host "[1/4] 打包已提交的代码 (git archive HEAD)..."
git archive --format=tar.gz -o "$env:TEMP\ski-deploy.tar.gz" HEAD

Write-Host "[2/4] 上传代码与 .env 到服务器..."
scp @SSH_OPTS "$env:TEMP\ski-deploy.tar.gz" .env "root@${SERVER}:/tmp/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "上传失败。最常见原因：代理 TUN 模式拦截了 SSH——请在代理软件加直连规则 IP-CIDR,$SERVER/32,DIRECT 或暂时关闭 TUN 后重试。" -ForegroundColor Yellow
    exit 1
}

Write-Host "[3/4] 服务器上解压并重新构建（约 5-10 分钟）..."
ssh @SSH_OPTS "root@$SERVER" "mkdir -p /opt/ski && tar -xzf /tmp/ski-deploy.tar.gz -C /opt/ski && mv -f /tmp/.env /opt/ski/.env && cd /opt/ski && docker compose -f docker-compose.prod.yml --profile caddy up -d --build 2>&1 | tail -5"
if ($LASTEXITCODE -ne 0) { Write-Host "远程构建失败，请查看上方输出" -ForegroundColor Red; exit 1 }

Write-Host "[4/4] 验证..."
Start-Sleep 5
$health = ssh @SSH_OPTS "root@$SERVER" "curl -s -o /dev/null -w '%{http_code}' --max-time 20 https://xiaoyuu.me/"
if ($health -eq "200") {
    Write-Host "部署成功: https://xiaoyuu.me 返回 200" -ForegroundColor Green
} else {
    Write-Host "网站返回 $health，请检查: ssh -i $KEY root@$SERVER 'docker compose -f /opt/ski/docker-compose.prod.yml ps'" -ForegroundColor Red
}
