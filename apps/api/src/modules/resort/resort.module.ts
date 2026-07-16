import { Module } from "@nestjs/common";
import { ResortController } from "./resort.controller";
import { ResortService } from "./resort.service";

@Module({
  controllers: [ResortController],
  providers: [ResortService],
  exports: [ResortService],
})
export class ResortModule {}
