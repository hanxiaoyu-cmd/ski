# 单镜像多服务：api / worker / web 共用一个构建产物，
# docker-compose.prod.yml 中以不同 command 启动。
FROM node:22-alpine

# Prisma 引擎依赖 openssl
RUN apk add --no-cache openssl

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.13.1 --activate \
  # 国内网络下 npmmirror 更快更稳；如在海外构建可删除此行
  && pnpm config set registry https://registry.npmmirror.com

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages
COPY data ./data

RUN pnpm install --frozen-lockfile

RUN pnpm build

# Next.js standalone 产物需要手动补齐静态资源
RUN cp -r apps/web/.next/static apps/web/.next/standalone/apps/web/.next/static \
  && cp -r apps/web/public apps/web/.next/standalone/apps/web/public

ENV NODE_ENV=production
