import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";

@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    let db = "ok";
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      db = "unreachable";
    }
    return { status: "ok", db, time: new Date().toISOString() };
  }
}
