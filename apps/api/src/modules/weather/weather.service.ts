import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ResortStatus } from "@ski/db";
import type { DailyForecast, ResortWeather } from "@ski/shared";
import { PrismaService } from "../../common/prisma.service";
import { CacheService } from "../../common/cache.service";
import { WEATHER_PROVIDER, WeatherProvider } from "./providers/weather-provider.interface";

const WEATHER_CACHE_TTL = 900; // 实况+预报聚合 15min

export interface SyncResult {
  found: number;
  changed: number;
  errors: string[];
}

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    @Inject(WEATHER_PROVIDER) private readonly provider: WeatherProvider,
  ) {}

  get providerConfigured(): boolean {
    return this.provider.isConfigured();
  }

  /** Worker 定时任务：拉取全部在营雪场的实况并落库 */
  async syncNowForAllResorts(): Promise<SyncResult> {
    const resorts = await this.prisma.resort.findMany({ where: { status: ResortStatus.ACTIVE } });
    const result: SyncResult = { found: resorts.length, changed: 0, errors: [] };
    for (const resort of resorts) {
      try {
        const data = await this.provider.fetchNow(resort.lat, resort.lng);
        const { raw, ...fields } = data;
        await this.prisma.weatherSnapshot.create({
          data: { resortId: resort.id, source: this.provider.sourceCode, ...fields, raw: raw as object },
        });
        result.changed += 1;
        await this.cache.del(`weather:${resort.slug}`);
      } catch (e) {
        const msg = `${resort.slug}: ${e instanceof Error ? e.message : String(e)}`;
        this.logger.warn(`sync now failed - ${msg}`);
        result.errors.push(msg);
      }
    }
    return result;
  }

  /** Worker 定时任务：拉取 7 日预报并按 (resort, date, source) upsert */
  async syncDailyForAllResorts(): Promise<SyncResult> {
    const resorts = await this.prisma.resort.findMany({ where: { status: ResortStatus.ACTIVE } });
    const result: SyncResult = { found: resorts.length, changed: 0, errors: [] };
    for (const resort of resorts) {
      try {
        const days = await this.provider.fetchDaily7(resort.lat, resort.lng);
        for (const day of days) {
          const { raw, forecastDate, ...fields } = day;
          await this.prisma.weatherForecastDaily.upsert({
            where: {
              resortId_forecastDate_source: {
                resortId: resort.id,
                forecastDate,
                source: this.provider.sourceCode,
              },
            },
            create: {
              resortId: resort.id,
              source: this.provider.sourceCode,
              forecastDate,
              ...fields,
              raw: raw as object,
            },
            update: { ...fields, raw: raw as object, fetchedAt: new Date() },
          });
        }
        result.changed += days.length;
        await this.cache.del(`weather:${resort.slug}`);
      } catch (e) {
        const msg = `${resort.slug}: ${e instanceof Error ? e.message : String(e)}`;
        this.logger.warn(`sync daily failed - ${msg}`);
        result.errors.push(msg);
      }
    }
    return result;
  }

  /** API：某雪场的实况 + 未来预报 */
  async getForResort(slug: string): Promise<ResortWeather> {
    const cacheKey = `weather:${slug}`;
    const cached = await this.cache.get<ResortWeather>(cacheKey);
    if (cached) return cached;

    const resort = await this.prisma.resort.findUnique({ where: { slug } });
    if (!resort) throw new NotFoundException(`resort not found: ${slug}`);

    const latest = await this.prisma.weatherSnapshot.findFirst({
      where: { resortId: resort.id },
      orderBy: { observedAt: "desc" },
    });

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const forecasts = await this.prisma.weatherForecastDaily.findMany({
      where: { resortId: resort.id, forecastDate: { gte: today } },
      orderBy: { forecastDate: "asc" },
    });

    const daily: DailyForecast[] = forecasts.map((f) => ({
      forecastDate: f.forecastDate.toISOString().slice(0, 10),
      tempMinC: f.tempMinC,
      tempMaxC: f.tempMaxC,
      conditionDay: f.conditionDay,
      conditionNight: f.conditionNight,
      snowfallMm: f.snowfallMm,
      precipProbPct: f.precipProbPct,
      windScale: f.windScale,
    }));

    const result: ResortWeather = {
      now: latest
        ? {
            observedAt: latest.observedAt.toISOString(),
            tempC: latest.tempC,
            feelsLikeC: latest.feelsLikeC,
            windSpeedKmh: latest.windSpeedKmh,
            windDir: latest.windDir,
            humidityPct: latest.humidityPct,
            conditionCode: latest.conditionCode,
            conditionText: latest.conditionText,
            visibilityKm: latest.visibilityKm,
            precipMm: latest.precipMm,
          }
        : null,
      daily,
    };

    await this.cache.set(cacheKey, result, WEATHER_CACHE_TTL);
    return result;
  }
}
