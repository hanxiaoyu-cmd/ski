import { Module } from "@nestjs/common";
import { WeatherModule } from "../weather/weather.module";
import { CrawlLogService } from "./crawl-log.service";
import { WeatherSyncJob } from "./weather-sync.job";

@Module({
  imports: [WeatherModule],
  providers: [CrawlLogService, WeatherSyncJob],
})
export class CrawlModule {}
