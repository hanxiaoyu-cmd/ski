import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { WorkerModule } from "./worker.module";

/**
 * Worker 进程：只跑定时任务与数据采集，不监听 HTTP 端口。
 * 采集故障不影响 API 可用性。
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule);
  app.enableShutdownHooks();
  console.log("[worker] scheduler started");
}

bootstrap();
