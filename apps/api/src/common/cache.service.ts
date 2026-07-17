import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";

/**
 * 缓存 key 版本：API 响应结构变化时 +1，让旧结构缓存自然失效，
 * 避免部署新代码后从 Redis 读出旧 shape 导致前端校验失败。
 */
const CACHE_VERSION = "v3";

/**
 * Cache-Aside 封装。Redis 不可用时静默降级为「无缓存」，不影响主流程。
 */
@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => Math.min(times * 1000, 30_000),
    });
    this.redis.on("error", (err) => this.logger.warn(`redis error: ${err.message}`));
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.redis.get(`${CACHE_VERSION}:${key}`);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    try {
      await this.redis.set(`${CACHE_VERSION}:${key}`, JSON.stringify(value), "EX", ttlSeconds);
    } catch {
      // 降级：缓存失败不影响主流程
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(`${CACHE_VERSION}:${key}`);
    } catch {
      // 同上
    }
  }

  async onModuleDestroy() {
    await this.redis.quit().catch(() => undefined);
  }
}
