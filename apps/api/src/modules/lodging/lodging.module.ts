import { Module } from "@nestjs/common";
import { LodgingController } from "./lodging.controller";
import { LodgingService } from "./lodging.service";

@Module({
  controllers: [LodgingController],
  providers: [LodgingService],
  exports: [LodgingService],
})
export class LodgingModule {}
