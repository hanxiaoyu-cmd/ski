import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CoreModule } from "./common/core.module";
import { HealthModule } from "./modules/health/health.module";
import { ResortModule } from "./modules/resort/resort.module";
import { WeatherModule } from "./modules/weather/weather.module";
import { LodgingModule } from "./modules/lodging/lodging.module";
import { BoardModule } from "./modules/board/board.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: [".env", "../../.env"] }),
    CoreModule,
    HealthModule,
    ResortModule,
    WeatherModule,
    LodgingModule,
    BoardModule,
  ],
})
export class AppModule {}
