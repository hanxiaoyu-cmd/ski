import { Module } from "@nestjs/common";
import { WeatherController } from "./weather.controller";
import { WeatherService } from "./weather.service";
import { QWeatherProvider } from "./providers/qweather.provider";
import { WEATHER_PROVIDER } from "./providers/weather-provider.interface";

@Module({
  controllers: [WeatherController],
  providers: [WeatherService, { provide: WEATHER_PROVIDER, useClass: QWeatherProvider }],
  exports: [WeatherService],
})
export class WeatherModule {}
