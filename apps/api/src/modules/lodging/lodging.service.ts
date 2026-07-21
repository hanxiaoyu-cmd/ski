import { Injectable, NotFoundException } from "@nestjs/common";
import { ResortStatus } from "@ski/db";
import type { LodgingInfo } from "@ski/shared";
import { PrismaService } from "../../common/prisma.service";
import { CacheService } from "../../common/cache.service";

const LODGING_CACHE_TTL = 21600; // 6h，与票价一致

@Injectable()
export class LodgingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async getForResort(slug: string): Promise<LodgingInfo[]> {
    const cacheKey = `resorts:lodgings:${slug}`;
    const cached = await this.cache.get<LodgingInfo[]>(cacheKey);
    if (cached) return cached;

    const resort = await this.prisma.resort.findUnique({ where: { slug } });
    if (!resort) throw new NotFoundException(`resort not found: ${slug}`);

    const lodgings = await this.prisma.lodging.findMany({
      where: { resortId: resort.id, status: ResortStatus.ACTIVE },
      // 按距雪场距离升序（未知距离排最后），同距离时滑进滑出优先
      orderBy: [{ distanceToResortM: { sort: "asc", nulls: "last" } }, { isSkiInOut: "desc" }],
      include: {
        prices: { orderBy: { crawledAt: "desc" }, take: 1 },
      },
    });

    const result: LodgingInfo[] = lodgings.map((l) => {
      const latest = l.prices[0] ?? null;
      return {
        id: l.id,
        name: l.name,
        type: l.type,
        distanceToResortM: l.distanceToResortM,
        isSkiInOut: l.isSkiInOut,
        address: l.address,
        links: (l.externalRefs ?? {}) as Record<string, string>,
        priceMinCents: latest?.priceMinCents ?? null,
        priceMaxCents: latest?.priceMaxCents ?? null,
        priceUpdatedAt: latest ? latest.crawledAt.toISOString() : null,
        rating: l.rating,
        priceFromCents: l.priceFromCents,
        photoUrl: l.photoUrl,
      };
    });

    await this.cache.set(cacheKey, result, LODGING_CACHE_TTL);
    return result;
  }
}
