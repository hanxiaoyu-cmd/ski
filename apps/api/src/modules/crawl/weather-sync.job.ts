import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { CrawlTargetKind, DataSourceType } from "@ski/db";
import { WeatherService } from "../weather/weather.service";
import { CrawlLogService } from "./crawl-log.service";

const CRON_NOW = CronExpression.EVERY_HOUR;
const CRON_DAILY = "0 0 */3 * * *"; // 每 3 小时

@Injectable()
export class WeatherSyncJob implements OnModuleInit {
  private readonly logger = new Logger(WeatherSyncJob.name);
  private nowTaskId?: number;
  private dailyTaskId?: number;

  constructor(
    private readonly weatherService: WeatherService,
    private readonly crawlLog: CrawlLogService,
  ) {}

  async onModuleInit() {
    if (!this.weatherService.providerConfigured) {
      this.logger.warn("QWEATHER_API_KEY / QWEATHER_API_HOST 未配置，天气采集任务将跳过");
      return;
    }
    this.nowTaskId = await this.crawlLog.ensureTask({
      sourceCode: "qweather",
      sourceName: "和风天气",
      sourceType: DataSourceType.API,
      targetKind: CrawlTargetKind.WEATHER,
      parserKey: "qweather-now",
      cronExpr: CRON_NOW,
    });
    this.dailyTaskId = await this.crawlLog.ensureTask({
      sourceCode: "qweather",
      sourceName: "和风天气",
      sourceType: DataSourceType.API,
      targetKind: CrawlTargetKind.WEATHER,
      parserKey: "qweather-daily",
      cronExpr: CRON_DAILY,
    });
    // 启动即执行一次，便于验证与冷启动补数
    await this.syncNow();
    await this.syncDaily();
  }

  @Cron(CRON_NOW)
  async syncNow() {
    if (!this.nowTaskId) return;
    this.logger.log("syncing weather now for all resorts...");
    await this.crawlLog.runLogged(this.nowTaskId, () => this.weatherService.syncNowForAllResorts());
  }

  @Cron(CRON_DAILY)
  async syncDaily() {
    if (!this.dailyTaskId) return;
    this.logger.log("syncing 7-day forecast for all resorts...");
    await this.crawlLog.runLogged(this.dailyTaskId, () => this.weatherService.syncDailyForAllResorts());
  }
}
