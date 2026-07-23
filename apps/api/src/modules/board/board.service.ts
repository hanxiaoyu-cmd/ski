import { Injectable, NotFoundException } from "@nestjs/common";
import { Board, BoardStatus, Prisma } from "@ski/db";
import type { BoardBrand, BoardCategory, BoardDetail, BoardSummary } from "@ski/shared";
import { PrismaService } from "../../common/prisma.service";
import { CacheService } from "../../common/cache.service";

const LIST_TTL = 3600;
const DETAIL_TTL = 3600;
const BRAND_TTL = 3600;

export interface BoardFilters {
  category?: BoardCategory;
  brand?: string;
  boardType?: string;
  level?: string;
}

function toSummary(b: Board): BoardSummary {
  return {
    slug: b.slug,
    brand: b.brand,
    name: b.name,
    category: b.category,
    boardType: b.boardType,
    camber: b.camber,
    flex: b.flex,
    level: b.level,
    gender: b.gender,
    year: b.year,
    sizesCm: b.sizesCm,
    priceCents: b.priceCents,
    priceFromCents: b.priceFromCents,
    coverImageUrl: b.coverImageUrl,
    highlights: b.highlights,
  };
}

@Injectable()
export class BoardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async list(filters: BoardFilters): Promise<BoardSummary[]> {
    const cacheKey = `boards:list:${filters.category ?? "all"}:${filters.brand ?? "all"}:${filters.boardType ?? "all"}:${filters.level ?? "all"}`;
    const cached = await this.cache.get<BoardSummary[]>(cacheKey);
    if (cached) return cached;

    const where: Prisma.BoardWhereInput = { status: BoardStatus.ACTIVE };
    if (filters.category) where.category = filters.category;
    if (filters.brand) where.brand = filters.brand;
    if (filters.boardType) where.boardType = filters.boardType;
    if (filters.level) where.level = filters.level;

    const boards = await this.prisma.board.findMany({
      where,
      orderBy: [{ brand: "asc" }, { name: "asc" }],
    });
    const result = boards.map(toSummary);
    await this.cache.set(cacheKey, result, LIST_TTL);
    return result;
  }

  async getBySlug(slug: string): Promise<BoardDetail> {
    const cacheKey = `boards:detail:${slug}`;
    const cached = await this.cache.get<BoardDetail>(cacheKey);
    if (cached) return cached;

    const b = await this.prisma.board.findUnique({ where: { slug } });
    if (!b || b.status !== BoardStatus.ACTIVE) {
      throw new NotFoundException(`board not found: ${slug}`);
    }
    const detail: BoardDetail = {
      ...toSummary(b),
      shape: b.shape,
      intro: b.intro,
      officialUrl: b.officialUrl,
      buyUrl: b.buyUrl,
    };
    await this.cache.set(cacheKey, detail, DETAIL_TTL);
    return detail;
  }

  async brands(category?: BoardCategory): Promise<BoardBrand[]> {
    const cacheKey = `boards:brands:${category ?? "all"}`;
    const cached = await this.cache.get<BoardBrand[]>(cacheKey);
    if (cached) return cached;

    const where: Prisma.BoardWhereInput = { status: BoardStatus.ACTIVE };
    if (category) where.category = category;

    const grouped = await this.prisma.board.groupBy({
      by: ["brand"],
      where,
      _count: { brand: true },
      orderBy: { brand: "asc" },
    });
    const result: BoardBrand[] = grouped.map((g) => ({ brand: g.brand, count: g._count.brand }));
    await this.cache.set(cacheKey, result, BRAND_TTL);
    return result;
  }
}
