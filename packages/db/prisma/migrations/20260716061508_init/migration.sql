-- CreateEnum
CREATE TYPE "resort_status" AS ENUM ('ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "trail_difficulty" AS ENUM ('GREEN', 'BLUE', 'RED', 'BLACK');

-- CreateEnum
CREATE TYPE "lift_type" AS ENUM ('GONDOLA', 'CHAIR', 'MAGIC_CARPET');

-- CreateEnum
CREATE TYPE "ticket_type" AS ENUM ('DAY', 'HALF_DAY', 'NIGHT', 'MULTI_DAY', 'SEASON', 'HOURLY');

-- CreateEnum
CREATE TYPE "day_type" AS ENUM ('WEEKDAY', 'WEEKEND', 'HOLIDAY', 'ALL');

-- CreateEnum
CREATE TYPE "channel" AS ENUM ('OFFICIAL', 'MEITUAN', 'CTRIP', 'QUNAR', 'DOUYIN', 'OTHER');

-- CreateEnum
CREATE TYPE "snow_type" AS ENUM ('POWDER', 'GROOMED', 'ICY', 'SLUSH');

-- CreateEnum
CREATE TYPE "report_source" AS ENUM ('OFFICIAL', 'MANUAL', 'CROWDSOURCE', 'ESTIMATED');

-- CreateEnum
CREATE TYPE "lodging_type" AS ENUM ('HOTEL', 'HOMESTAY', 'APARTMENT');

-- CreateEnum
CREATE TYPE "data_source_type" AS ENUM ('API', 'CRAWLER', 'MANUAL');

-- CreateEnum
CREATE TYPE "crawl_target_kind" AS ENUM ('WEATHER', 'TICKET', 'LODGING', 'CROWD', 'SNOW');

-- CreateEnum
CREATE TYPE "crawl_run_status" AS ENUM ('SUCCESS', 'PARTIAL', 'FAILED');

-- CreateTable
CREATE TABLE "resort" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "altitude_base_m" INTEGER,
    "altitude_top_m" INTEGER,
    "total_trail_km" DOUBLE PRECISION,
    "season_open" TEXT,
    "season_close" TEXT,
    "official_website" TEXT,
    "official_wechat_name" TEXT,
    "phone" TEXT,
    "intro" TEXT,
    "cover_image_url" TEXT,
    "status" "resort_status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resort_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trail" (
    "id" SERIAL NOT NULL,
    "resort_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "difficulty" "trail_difficulty" NOT NULL,
    "length_m" INTEGER,
    "vertical_m" INTEGER,
    "is_night" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "trail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lift" (
    "id" SERIAL NOT NULL,
    "resort_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" "lift_type" NOT NULL,
    "capacity_per_hour" INTEGER,

    CONSTRAINT "lift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lodging" (
    "id" SERIAL NOT NULL,
    "resort_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" "lodging_type" NOT NULL,
    "distance_to_resort_m" INTEGER,
    "is_ski_in_out" BOOLEAN NOT NULL DEFAULT false,
    "address" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "external_refs" JSONB,
    "status" "resort_status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lodging_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weather_snapshot" (
    "id" SERIAL NOT NULL,
    "resort_id" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "observed_at" TIMESTAMP(3) NOT NULL,
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "temp_c" DOUBLE PRECISION,
    "feels_like_c" DOUBLE PRECISION,
    "wind_speed_kmh" DOUBLE PRECISION,
    "wind_dir" TEXT,
    "humidity_pct" INTEGER,
    "condition_code" TEXT,
    "condition_text" TEXT,
    "visibility_km" DOUBLE PRECISION,
    "precip_mm" DOUBLE PRECISION,
    "raw" JSONB,

    CONSTRAINT "weather_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weather_forecast_daily" (
    "id" SERIAL NOT NULL,
    "resort_id" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "forecast_date" DATE NOT NULL,
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "temp_min_c" DOUBLE PRECISION,
    "temp_max_c" DOUBLE PRECISION,
    "condition_day" TEXT,
    "condition_night" TEXT,
    "snowfall_mm" DOUBLE PRECISION,
    "precip_prob_pct" INTEGER,
    "wind_scale" TEXT,
    "raw" JSONB,

    CONSTRAINT "weather_forecast_daily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "snow_condition" (
    "id" SERIAL NOT NULL,
    "resort_id" INTEGER NOT NULL,
    "reported_at" TIMESTAMP(3) NOT NULL,
    "source" "report_source" NOT NULL,
    "snow_depth_cm" INTEGER,
    "new_snow_cm" INTEGER,
    "snow_type" "snow_type",
    "open_trail_count" INTEGER,
    "open_lift_count" INTEGER,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "snow_condition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_product" (
    "id" SERIAL NOT NULL,
    "resort_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "ticket_type" "ticket_type" NOT NULL,
    "day_type" "day_type" NOT NULL DEFAULT 'ALL',
    "channel" "channel" NOT NULL DEFAULT 'OFFICIAL',
    "price_cents" INTEGER NOT NULL,
    "original_price_cents" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'CNY',
    "valid_from" DATE,
    "valid_to" DATE,
    "purchase_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "first_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "crawl_run_id" INTEGER,

    CONSTRAINT "ticket_product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lodging_price" (
    "id" SERIAL NOT NULL,
    "lodging_id" INTEGER NOT NULL,
    "stay_date" DATE NOT NULL,
    "price_min_cents" INTEGER,
    "price_max_cents" INTEGER,
    "channel" "channel" NOT NULL DEFAULT 'OFFICIAL',
    "crawled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "crawl_run_id" INTEGER,

    CONSTRAINT "lodging_price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crowd_report" (
    "id" SERIAL NOT NULL,
    "resort_id" INTEGER NOT NULL,
    "reported_at" TIMESTAMP(3) NOT NULL,
    "source" "report_source" NOT NULL,
    "crowd_level" SMALLINT NOT NULL,
    "lift_wait_min" INTEGER,
    "ticket_sold_out" BOOLEAN,
    "reporter_user_id" INTEGER,
    "raw_text" TEXT,
    "confidence" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crowd_report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_source" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "data_source_type" NOT NULL,
    "base_url" TEXT,
    "rate_limit_per_min" INTEGER,
    "config" JSONB,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crawl_task" (
    "id" SERIAL NOT NULL,
    "source_id" INTEGER NOT NULL,
    "resort_id" INTEGER,
    "target_kind" "crawl_target_kind" NOT NULL,
    "target_url" TEXT,
    "cron_expr" TEXT NOT NULL,
    "parser_key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "last_run_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crawl_task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crawl_run" (
    "id" SERIAL NOT NULL,
    "task_id" INTEGER NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),
    "status" "crawl_run_status" NOT NULL,
    "items_found" INTEGER NOT NULL DEFAULT 0,
    "items_changed" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,

    CONSTRAINT "crawl_run_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "resort_slug_key" ON "resort"("slug");

-- CreateIndex
CREATE INDEX "resort_province_idx" ON "resort"("province");

-- CreateIndex
CREATE INDEX "trail_resort_id_idx" ON "trail"("resort_id");

-- CreateIndex
CREATE INDEX "lift_resort_id_idx" ON "lift"("resort_id");

-- CreateIndex
CREATE INDEX "lodging_resort_id_idx" ON "lodging"("resort_id");

-- CreateIndex
CREATE INDEX "weather_snapshot_resort_id_observed_at_idx" ON "weather_snapshot"("resort_id", "observed_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "weather_forecast_daily_resort_id_forecast_date_source_key" ON "weather_forecast_daily"("resort_id", "forecast_date", "source");

-- CreateIndex
CREATE INDEX "snow_condition_resort_id_reported_at_idx" ON "snow_condition"("resort_id", "reported_at" DESC);

-- CreateIndex
CREATE INDEX "ticket_product_resort_id_is_active_valid_from_idx" ON "ticket_product"("resort_id", "is_active", "valid_from");

-- CreateIndex
CREATE INDEX "lodging_price_lodging_id_stay_date_idx" ON "lodging_price"("lodging_id", "stay_date");

-- CreateIndex
CREATE INDEX "crowd_report_resort_id_reported_at_idx" ON "crowd_report"("resort_id", "reported_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "data_source_code_key" ON "data_source"("code");

-- CreateIndex
CREATE INDEX "crawl_task_enabled_idx" ON "crawl_task"("enabled");

-- CreateIndex
CREATE INDEX "crawl_run_task_id_started_at_idx" ON "crawl_run"("task_id", "started_at" DESC);

-- AddForeignKey
ALTER TABLE "trail" ADD CONSTRAINT "trail_resort_id_fkey" FOREIGN KEY ("resort_id") REFERENCES "resort"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lift" ADD CONSTRAINT "lift_resort_id_fkey" FOREIGN KEY ("resort_id") REFERENCES "resort"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lodging" ADD CONSTRAINT "lodging_resort_id_fkey" FOREIGN KEY ("resort_id") REFERENCES "resort"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weather_snapshot" ADD CONSTRAINT "weather_snapshot_resort_id_fkey" FOREIGN KEY ("resort_id") REFERENCES "resort"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weather_forecast_daily" ADD CONSTRAINT "weather_forecast_daily_resort_id_fkey" FOREIGN KEY ("resort_id") REFERENCES "resort"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "snow_condition" ADD CONSTRAINT "snow_condition_resort_id_fkey" FOREIGN KEY ("resort_id") REFERENCES "resort"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_product" ADD CONSTRAINT "ticket_product_resort_id_fkey" FOREIGN KEY ("resort_id") REFERENCES "resort"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_product" ADD CONSTRAINT "ticket_product_crawl_run_id_fkey" FOREIGN KEY ("crawl_run_id") REFERENCES "crawl_run"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lodging_price" ADD CONSTRAINT "lodging_price_lodging_id_fkey" FOREIGN KEY ("lodging_id") REFERENCES "lodging"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lodging_price" ADD CONSTRAINT "lodging_price_crawl_run_id_fkey" FOREIGN KEY ("crawl_run_id") REFERENCES "crawl_run"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crowd_report" ADD CONSTRAINT "crowd_report_resort_id_fkey" FOREIGN KEY ("resort_id") REFERENCES "resort"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crawl_task" ADD CONSTRAINT "crawl_task_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "data_source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crawl_task" ADD CONSTRAINT "crawl_task_resort_id_fkey" FOREIGN KEY ("resort_id") REFERENCES "resort"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crawl_run" ADD CONSTRAINT "crawl_run_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "crawl_task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
