import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, Resort, ResortStatus, WeatherSnapshot } from "@ski/db";
import type { ResortDetail, ResortSummary, TicketProduct, WeatherNow } from "@ski/shared";
import { PrismaService } from "../../common/prisma.service";
import { CacheService } from "../../common/cache.service";

const LIST_CACHE_TTL = 600; // 首页聚合 10min
const DETAIL_CACHE_TTL = 3600; // 静态详情 1h
const TICKET_CACHE_TTL = 21600; // 票价 6h

function toWeatherNow(s: WeatherSnapshot | null | undefined): WeatherNow | null {
  if (!s) return null;
  return {
    observedAt: s.observedAt.toISOString(),
    tempC: s.tempC,
    feelsLikeC: s.feelsLikeC,
    windSpeedKmh: s.windSpeedKmh,
    windDir: s.windDir,
    humidityPct: s.humidityPct,
    conditionCode: s.conditionCode,
    conditionText: s.conditionText,
    visibilityKm: s.visibilityKm,
    precipMm: s.precipMm,
  };
}

function toSummary(r: Resort, weatherNow: WeatherNow | null): ResortSummary {
  return {
    slug: r.slug,
    name: r.name,
    province: r.province,
    city: r.city,
    lat: r.lat,
    lng: r.lng,
    altitudeBaseM: r.altitudeBaseM,
    altitudeTopM: r.altitudeTopM,
    totalTrailKm: r.totalTrailKm,
    seasonOpen: r.seasonOpen,
    seasonClose: r.seasonClose,
    coverImageUrl: r.coverImageUrl,
    weatherNow,
  };
}

@Injectable()
export class ResortService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async list(province?: string): Promise<ResortSummary[]> {
    const cacheKey = `resorts:list:${province ?? "all"}`;
    const cached = await this.cache.get<ResortSummary[]>(cacheKey);
    if (cached) return cached;

    const where: Prisma.ResortWhereInput = { status: ResortStatus.ACTIVE };
    if (province) where.province = province;

    const resorts = await this.prisma.resort.findMany({ where, orderBy: { id: "asc" } });
    const result = await Promise.all(
      resorts.map(async (r) => {
        const latest = await this.prisma.weatherSnapshot.findFirst({
          where: { resortId: r.id },
          orderBy: { observedAt: "desc" },
        });
        return toSummary(r, toWeatherNow(latest));
      }),
    );

    await this.cache.set(cacheKey, result, LIST_CACHE_TTL);
    return result;
  }

  async getBySlug(slug: string): Promise<ResortDetail> {
    const cacheKey = `resorts:detail:${slug}`;
    const cached = await this.cache.get<ResortDetail>(cacheKey);
    if (cached) return cached;

    const resort = await this.prisma.resort.findUnique({
      where: { slug },
      include: { trails: true },
    });
    if (!resort || resort.status !== ResortStatus.ACTIVE) {
      throw new NotFoundException(`resort not found: ${slug}`);
    }

    const latest = await this.prisma.weatherSnapshot.findFirst({
      where: { resortId: resort.id },
      orderBy: { observedAt: "desc" },
    });

    const byDifficulty: Record<string, number> = {};
    for (const t of resort.trails) {
      byDifficulty[t.difficulty] = (byDifficulty[t.difficulty] ?? 0) + 1;
    }

    const detail: ResortDetail = {
      ...toSummary(resort, toWeatherNow(latest)),
      officialWebsite: resort.officialWebsite,
      officialWechatName: resort.officialWechatName,
      phone: resort.phone,
      intro: resort.intro,
      trailStats: { total: resort.trails.length, byDifficulty },
    };

    await this.cache.set(cacheKey, detail, DETAIL_CACHE_TTL);
    return detail;
  }

  async getTickets(slug: string): Promise<TicketProduct[]> {
    const cacheKey = `resorts:tickets:${slug}`;
    const cached = await this.cache.get<TicketProduct[]>(cacheKey);
    if (cached) return cached;

    const resort = await this.prisma.resort.findUnique({ where: { slug } });
    if (!resort) throw new NotFoundException(`resort not found: ${slug}`);

    const tickets = await this.prisma.ticketProduct.findMany({
      where: { resortId: resort.id, isActive: true },
      orderBy: [{ ticketType: "asc" }, { dayType: "asc" }, { priceCents: "asc" }],
    });

    const result: TicketProduct[] = tickets.map((t) => ({
      id: t.id,
      name: t.name,
      ticketType: t.ticketType,
      dayType: t.dayType,
      channel: t.channel,
      priceCents: t.priceCents,
      originalPriceCents: t.originalPriceCents,
      validFrom: t.validFrom ? t.validFrom.toISOString().slice(0, 10) : null,
      validTo: t.validTo ? t.validTo.toISOString().slice(0, 10) : null,
      purchaseUrl: t.purchaseUrl,
    }));

    await this.cache.set(cacheKey, result, TICKET_CACHE_TTL);
    return result;
  }
}
