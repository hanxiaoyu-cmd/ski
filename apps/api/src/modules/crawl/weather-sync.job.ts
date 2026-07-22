import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { CrawlTargetKind, DataSourceType } from "@ski/db";
import { WeatherService } from "../weather/weather.service";
import { CrawlLogService } from "./crawl-log.service";

// 雪场扩到 40+ 家后放缓频率，保持在和风免费额度（5 万次/月）内：
// 43 场 × (12+8+4) 次/天 ≈ 3.1 万次/月
const CRON_NOW = "0 0 */2 * * *"; // 实况每 2 小时
const CRON_HOURLY = "0 30 */3 * * *"; // 24h 预报每 3 小时（错开整点）
const CRON_DAILY = "0 15 */6 * * *"; // 7 日预报每 6 小时

@Injectable()
export class WeatherSyncJob implements OnModuleInit {
  private readonly logger = new Logger(WeatherSyncJob.name);
  private nowTaskId?: number;
  private hourlyTaskId?: number;
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
    this.hourlyTaskId = await this.crawlLog.ensureTask({
      sourceCode: "qweather",
      sourceName: "和风天气",
      sourceType: DataSourceType.API,
      targetKind: CrawlTargetKind.WEATHER,
      parserKey: "qweather-hourly",
      cronExpr: CRON_HOURLY,
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
    await this.syncHourly();
    await this.syncDaily();
  }

  @Cron(CRON_NOW)
  async syncNow() {
    if (!this.nowTaskId) return;
    this.logger.log("syncing weather now for all resorts...");
    await this.crawlLog.runLogged(this.nowTaskId, () => this.weatherService.syncNowForAllResorts());
  }

  @Cron(CRON_HOURLY)
  async syncHourly() {
    if (!this.hourlyTaskId) return;
    this.logger.log("syncing 24h hourly forecast for all resorts...");
    await this.crawlLog.runLogged(this.hourlyTaskId, () =>
      this.weatherService.syncHourlyForAllResorts(),
    );
  }

  @Cron(CRON_DAILY)
  async syncDaily() {
    if (!this.dailyTaskId) return;
    this.logger.log("syncing 7-day forecast for all resorts...");
    await this.crawlLog.runLogged(this.dailyTaskId, () => this.weatherService.syncDailyForAllResorts());
  }
}
