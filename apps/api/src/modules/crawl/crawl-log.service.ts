import { Injectable } from "@nestjs/common";
import { CrawlRunStatus, CrawlTargetKind, DataSourceType } from "@ski/db";
import { PrismaService } from "../../common/prisma.service";

/**
 * 采集可观测性：每次执行都在 crawl_run 落一条记录。
 * data_source / crawl_task 不存在时自动注册（幂等）。
 */
@Injectable()
export class CrawlLogService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureTask(options: {
    sourceCode: string;
    sourceName: string;
    sourceType: DataSourceType;
    targetKind: CrawlTargetKind;
    parserKey: string;
    cronExpr: string;
  }): Promise<number> {
    const source = await this.prisma.dataSource.upsert({
      where: { code: options.sourceCode },
      create: { code: options.sourceCode, name: options.sourceName, type: options.sourceType },
      update: {},
    });

    const existing = await this.prisma.crawlTask.findFirst({
      where: { sourceId: source.id, parserKey: options.parserKey },
    });
    if (existing) return existing.id;

    const created = await this.prisma.crawlTask.create({
      data: {
        sourceId: source.id,
        targetKind: options.targetKind,
        parserKey: options.parserKey,
        cronExpr: options.cronExpr,
      },
    });
    return created.id;
  }

  /** 包裹一次采集执行：写入 crawl_run 并更新任务的 last_run_at */
  async runLogged(
    taskId: number,
    fn: () => Promise<{ found: number; changed: number; errors: string[] }>,
  ): Promise<void> {
    const run = await this.prisma.crawlRun.create({
      data: { taskId, status: CrawlRunStatus.FAILED },
    });
    try {
      const { found, changed, errors } = await fn();
      const status =
        errors.length === 0
          ? CrawlRunStatus.SUCCESS
          : changed > 0
            ? CrawlRunStatus.PARTIAL
            : CrawlRunStatus.FAILED;
      await this.prisma.crawlRun.update({
        where: { id: run.id },
        data: {
          status,
          finishedAt: new Date(),
          itemsFound: found,
          itemsChanged: changed,
          errorMessage: errors.length ? errors.join(" | ").slice(0, 2000) : null,
        },
      });
    } catch (e) {
      await this.prisma.crawlRun.update({
        where: { id: run.id },
        data: {
          status: CrawlRunStatus.FAILED,
          finishedAt: new Date(),
          errorMessage: e instanceof Error ? e.message : String(e),
        },
      });
    } finally {
      await this.prisma.crawlTask.update({ where: { id: taskId }, data: { lastRunAt: new Date() } });
    }
  }
}
