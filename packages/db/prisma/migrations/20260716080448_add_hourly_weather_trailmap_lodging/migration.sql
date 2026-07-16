-- AlterTable
ALTER TABLE "resort" ADD COLUMN     "trail_map_url" TEXT;

-- CreateTable
CREATE TABLE "weather_forecast_hourly" (
    "id" SERIAL NOT NULL,
    "resort_id" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "forecast_time" TIMESTAMP(3) NOT NULL,
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "temp_c" DOUBLE PRECISION,
    "condition_code" TEXT,
    "condition_text" TEXT,
    "wind_speed_kmh" DOUBLE PRECISION,
    "humidity_pct" INTEGER,
    "precip_mm" DOUBLE PRECISION,
    "precip_prob_pct" INTEGER,
    "raw" JSONB,

    CONSTRAINT "weather_forecast_hourly_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "weather_forecast_hourly_resort_id_forecast_time_idx" ON "weather_forecast_hourly"("resort_id", "forecast_time");

-- CreateIndex
CREATE UNIQUE INDEX "weather_forecast_hourly_resort_id_forecast_time_source_key" ON "weather_forecast_hourly"("resort_id", "forecast_time", "source");

-- AddForeignKey
ALTER TABLE "weather_forecast_hourly" ADD CONSTRAINT "weather_forecast_hourly_resort_id_fkey" FOREIGN KEY ("resort_id") REFERENCES "resort"("id") ON DELETE CASCADE ON UPDATE CASCADE;
