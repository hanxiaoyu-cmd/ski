import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  WeatherDailyData,
  WeatherNowData,
  WeatherProvider,
} from "./weather-provider.interface";

interface QWeatherNowResponse {
  code: string;
  now: {
    obsTime: string;
    temp: string;
    feelsLike: string;
    icon: string;
    text: string;
    windDir: string;
    windSpeed: string;
    humidity: string;
    precip: string;
    vis: string;
  };
}

interface QWeatherDailyResponse {
  code: string;
  daily: Array<{
    fxDate: string;
    tempMax: string;
    tempMin: string;
    iconDay: string;
    textDay: string;
    iconNight: string;
    textNight: string;
    windScaleDay: string;
    precip: string;
  }>;
}

class NonRetryableError extends Error {}

function num(v: string | undefined): number | null {
  if (v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

@Injectable()
export class QWeatherProvider implements WeatherProvider {
  readonly sourceCode = "qweather";
  private readonly logger = new Logger(QWeatherProvider.name);
  private readonly apiKey: string;
  private readonly apiHost: string;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>("QWEATHER_API_KEY") ?? "";
    let host = (config.get<string>("QWEATHER_API_HOST") ?? "").trim().replace(/\/$/, "");
    // 允许 .env 里只填域名不带协议
    if (host && !/^https?:\/\//.test(host)) {
      host = `https://${host}`;
    }
    this.apiHost = host;
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0 && this.apiHost.length > 0;
  }

  private async request<T extends { code: string }>(path: string): Promise<T> {
    const maxAttempts = 3;
    let lastError: unknown;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const res = await fetch(`${this.apiHost}${path}`, {
          headers: { "X-QW-Api-Key": this.apiKey },
          signal: AbortSignal.timeout(15_000),
        });
        if (!res.ok) {
          throw new Error(`qweather HTTP ${res.status} for ${path}`);
        }
        const body = (await res.json()) as T;
        if (body.code !== "200") {
          // 业务错误码（如 key 无效、额度用尽）重试无意义，直接抛出
          throw new NonRetryableError(`qweather business code ${body.code} for ${path}`);
        }
        return body;
      } catch (e) {
        if (e instanceof NonRetryableError) throw e;
        lastError = e;
        if (attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, attempt * 2000));
        }
      }
    }
    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  }

  async fetchNow(lat: number, lng: number): Promise<WeatherNowData> {
    // 和风要求 location=经度,纬度（经度在前），最多两位小数
    const location = `${lng.toFixed(2)},${lat.toFixed(2)}`;
    const body = await this.request<QWeatherNowResponse>(`/v7/weather/now?location=${location}`);
    const now = body.now;
    return {
      observedAt: new Date(now.obsTime),
      tempC: num(now.temp),
      feelsLikeC: num(now.feelsLike),
      windSpeedKmh: num(now.windSpeed),
      windDir: now.windDir || null,
      humidityPct: num(now.humidity),
      conditionCode: now.icon || null,
      conditionText: now.text || null,
      visibilityKm: num(now.vis),
      precipMm: num(now.precip),
      raw: body,
    };
  }

  async fetchDaily7(lat: number, lng: number): Promise<WeatherDailyData[]> {
    const location = `${lng.toFixed(2)},${lat.toFixed(2)}`;
    const body = await this.request<QWeatherDailyResponse>(`/v7/weather/7d?location=${location}`);
    return body.daily.map((d) => {
      const snowy = d.textDay.includes("雪") || d.textNight.includes("雪");
      return {
        forecastDate: new Date(`${d.fxDate}T00:00:00Z`),
        tempMinC: num(d.tempMin),
        tempMaxC: num(d.tempMax),
        conditionDay: d.textDay || null,
        conditionNight: d.textNight || null,
        // 和风 7d 无独立降雪量字段：天气现象为雪时以总降水量近似
        snowfallMm: snowy ? num(d.precip) : 0,
        precipProbPct: null,
        windScale: d.windScaleDay || null,
        raw: d,
      };
    });
  }
}
