/**
 * 天气数据源抽象。主源为和风天气（QWeatherProvider），
 * 后续可加彩云天气等实现并按 resort 或全局切换。
 */

export interface WeatherNowData {
  observedAt: Date;
  tempC: number | null;
  feelsLikeC: number | null;
  windSpeedKmh: number | null;
  windDir: string | null;
  humidityPct: number | null;
  conditionCode: string | null;
  conditionText: string | null;
  visibilityKm: number | null;
  precipMm: number | null;
  raw: unknown;
}

export interface WeatherDailyData {
  forecastDate: Date;
  tempMinC: number | null;
  tempMaxC: number | null;
  conditionDay: string | null;
  conditionNight: string | null;
  snowfallMm: number | null;
  precipProbPct: number | null;
  windScale: string | null;
  raw: unknown;
}

export interface WeatherProvider {
  /** 写入 weather_snapshot.source / data_source.code 的标识 */
  readonly sourceCode: string;
  /** 未配置 API Key 时返回 false，调度任务应跳过 */
  isConfigured(): boolean;
  fetchNow(lat: number, lng: number): Promise<WeatherNowData>;
  fetchDaily7(lat: number, lng: number): Promise<WeatherDailyData[]>;
}

export const WEATHER_PROVIDER = Symbol("WEATHER_PROVIDER");
