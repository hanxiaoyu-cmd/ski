import { Controller, Get, Param, Query } from "@nestjs/common";
import type { BoardCategory } from "@ski/shared";
import { BoardService } from "./board.service";

@Controller("boards")
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get()
  list(
    @Query("category") category?: BoardCategory,
    @Query("brand") brand?: string,
    @Query("boardType") boardType?: string,
    @Query("level") level?: string,
  ) {
    return this.boardService.list({ category, brand, boardType, level });
  }

  @Get("brands")
  brands(@Query("category") category?: BoardCategory) {
    return this.boardService.brands(category);
  }

  @Get(":slug")
  detail(@Param("slug") slug: string) {
    return this.boardService.getBySlug(slug);
  }
}
