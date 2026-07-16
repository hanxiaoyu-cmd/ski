import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { CoreModule } from "./common/core.module";
import { WeatherModule } from "./modules/weather/weather.module";
import { CrawlModule } from "./modules/crawl/crawl.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: [".env", "../../.env"] }),
    ScheduleModule.forRoot(),
    CoreModule,
    WeatherModule,
    CrawlModule,
  ],
})
export class WorkerModule {}
