import { Controller, Get, Param } from "@nestjs/common";
import { LodgingService } from "./lodging.service";

@Controller("resorts")
export class LodgingController {
  constructor(private readonly lodgingService: LodgingService) {}

  @Get(":slug/lodgings")
  lodgings(@Param("slug") slug: string) {
    return this.lodgingService.getForResort(slug);
  }
}
