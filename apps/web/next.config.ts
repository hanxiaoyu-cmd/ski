import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 部署时用 standalone 减小镜像体积；Windows 本地开发下 standalone 的
  // symlink 步骤需要管理员/开发者模式权限，故仅在 Linux 构建环境开启。
  output: process.platform === "win32" ? undefined : "standalone",
};

export default nextConfig;
