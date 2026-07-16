import { z } from "zod";

export const weatherNowSchema = z.object({
  observedAt: z.string(),
  tempC: z.number().nullable(),
  feelsLikeC: z.number().nullable(),
  windSpeedKmh: z.number().nullable(),
  windDir: z.string().nullable(),
  humidityPct: z.number().nullable(),
  conditionCode: z.string().nullable(),
  conditionText: z.string().nullable(),
  visibilityKm: z.number().nullable(),
  precipMm: z.number().nullable(),
});
export type WeatherNow = z.infer<typeof weatherNowSchema>;

export const dailyForecastSchema = z.object({
  forecastDate: z.string(),
  tempMinC: z.number().nullable(),
  tempMaxC: z.number().nullable(),
  conditionDay: z.string().nullable(),
  conditionNight: z.string().nullable(),
  snowfallMm: z.number().nullable(),
  precipProbPct: z.number().nullable(),
  windScale: z.string().nullable(),
});
export type DailyForecast = z.infer<typeof dailyForecastSchema>;

export const resortWeatherSchema = z.object({
  now: weatherNowSchema.nullable(),
  daily: z.array(dailyForecastSchema),
});
export type ResortWeather = z.infer<typeof resortWeatherSchema>;
