-- CreateEnum
CREATE TYPE "board_category" AS ENUM ('SNOWBOARD', 'SKI');

-- CreateEnum
CREATE TYPE "board_status" AS ENUM ('ACTIVE', 'DISCONTINUED');

-- CreateTable
CREATE TABLE "board" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "board_category" NOT NULL,
    "board_type" TEXT,
    "camber" TEXT,
    "shape" TEXT,
    "flex" INTEGER,
    "level" TEXT,
    "gender" TEXT,
    "sizes_cm" INTEGER[],
    "year" INTEGER,
    "price_cents" INTEGER,
    "price_from_cents" INTEGER,
    "official_url" TEXT,
    "buy_url" TEXT,
    "cover_image_url" TEXT,
    "intro" TEXT,
    "highlights" TEXT[],
    "status" "board_status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "board_slug_key" ON "board"("slug");

-- CreateIndex
CREATE INDEX "board_brand_idx" ON "board"("brand");

-- CreateIndex
CREATE INDEX "board_category_idx" ON "board"("category");
