import { Controller, Get, Param, Query } from "@nestjs/common";
import { ResortService } from "./resort.service";

@Controller("resorts")
export class ResortController {
  constructor(private readonly resortService: ResortService) {}

  @Get()
  list(@Query("province") province?: string) {
    return this.resortService.list(province);
  }

  @Get(":slug")
  detail(@Param("slug") slug: string) {
    return this.resortService.getBySlug(slug);
  }

  @Get(":slug/tickets")
  tickets(@Param("slug") slug: string) {
    return this.resortService.getTickets(slug);
  }
}
