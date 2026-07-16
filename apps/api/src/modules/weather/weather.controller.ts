import { Controller, Get, Param } from "@nestjs/common";
import { WeatherService } from "./weather.service";

@Controller("resorts")
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get(":slug/weather")
  weather(@Param("slug") slug: string) {
    return this.weatherService.getForResort(slug);
  }
}
