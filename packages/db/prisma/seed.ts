import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient, TicketType, DayType, Channel, LodgingType, BoardCategory } from "@prisma/client";

const prisma = new PrismaClient();
const seedsDir = join(__dirname, "..", "..", "..", "data", "seeds");

interface ResortSeed {
  slug: string;
  name: string;
  province: string;
  city: string;
  lat: number;
  lng: number;
  altitudeBaseM?: number;
  altitudeTopM?: number;
  totalTrailKm?: number;
  seasonOpen?: string;
  seasonClose?: string;
  officialWebsite?: string;
  officialWechatName?: string;
  intro?: string;
  coverImageUrl?: string;
  trailMapUrl?: string;
  transport?: Array<{ mode: string; title: string; detail: string }>;
  isIndoor?: boolean;
}

interface TicketSeed {
  resortSlug: string;
  name: string;
  ticketType: keyof typeof TicketType;
  dayType?: keyof typeof DayType;
  priceCents: number;
  validFrom?: string;
  validTo?: string;
}

async function seedResorts() {
  const file = join(seedsDir, "resorts.json");
  const resorts: ResortSeed[] = JSON.parse(readFileSync(file, "utf8"));
  for (const r of resorts) {
    const { slug, transport, ...rest } = r;
    const data = { ...rest, transport: transport ?? undefined };
    await prisma.resort.upsert({
      where: { slug },
      create: { slug, ...data },
      update: data,
    });
  }
  console.log(`seeded ${resorts.length} resorts`);
}

async function seedTickets() {
  const file = join(seedsDir, "tickets-manual.json");
  if (!existsSync(file)) {
    console.log("tickets-manual.json not found, skipping tickets");
    return;
  }
  const tickets: TicketSeed[] = JSON.parse(readFileSync(file, "utf8"));
  const bySlug = new Map<string, TicketSeed[]>();
  for (const t of tickets) {
    const list = bySlug.get(t.resortSlug) ?? [];
    list.push(t);
    bySlug.set(t.resortSlug, list);
  }
  let count = 0;
  for (const [slug, list] of bySlug) {
    const resort = await prisma.resort.findUnique({ where: { slug } });
    if (!resort) {
      console.warn(`unknown resort slug in tickets-manual.json: ${slug}`);
      continue;
    }
    // 种子票价均为官方渠道人工录入：先清掉旧种子再写入，避免重复
    await prisma.ticketProduct.deleteMany({
      where: { resortId: resort.id, channel: Channel.OFFICIAL, crawlRunId: null },
    });
    await prisma.ticketProduct.createMany({
      data: list.map((t) => ({
        resortId: resort.id,
        name: t.name,
        ticketType: TicketType[t.ticketType],
        dayType: t.dayType ? DayType[t.dayType] : DayType.ALL,
        channel: Channel.OFFICIAL,
        priceCents: t.priceCents,
        validFrom: t.validFrom ? new Date(t.validFrom) : null,
        validTo: t.validTo ? new Date(t.validTo) : null,
      })),
    });
    count += list.length;
  }
  console.log(`seeded ${count} ticket products`);
}

interface LodgingSeed {
  resortSlug: string;
  name: string;
  type: keyof typeof LodgingType;
  distanceToResortM?: number;
  isSkiInOut?: boolean;
  address?: string;
  links?: Record<string, string>;
  rating?: number;
  /** 参考起价（元/晚） */
  priceFrom?: number;
  photo?: string;
}

async function seedLodgings() {
  const file = join(seedsDir, "lodgings.json");
  if (!existsSync(file)) {
    console.log("lodgings.json not found, skipping lodgings");
    return;
  }
  const lodgings: LodgingSeed[] = JSON.parse(readFileSync(file, "utf8"));

  // 住宿数据目前完全由种子文件管理：对文件覆盖到的雪场做整体替换，
  // 避免改名/纠错后旧条目残留
  const slugs = [...new Set(lodgings.map((l) => l.resortSlug))];
  const resorts = await prisma.resort.findMany({ where: { slug: { in: slugs } } });
  const idBySlug = new Map(resorts.map((r) => [r.slug, r.id]));
  await prisma.lodging.deleteMany({ where: { resortId: { in: [...idBySlug.values()] } } });

  let count = 0;
  for (const l of lodgings) {
    const resortId = idBySlug.get(l.resortSlug);
    if (!resortId) {
      console.warn(`unknown resort slug in lodgings.json: ${l.resortSlug}`);
      continue;
    }
    await prisma.lodging.create({
      data: {
        resortId,
        name: l.name,
        type: LodgingType[l.type],
        distanceToResortM: l.distanceToResortM ?? null,
        isSkiInOut: l.isSkiInOut ?? false,
        address: l.address ?? null,
        externalRefs: l.links ?? {},
        rating: l.rating ?? null,
        priceFromCents: l.priceFrom != null ? Math.round(l.priceFrom * 100) : null,
        photoUrl: l.photo ?? null,
      },
    });
    count += 1;
  }
  console.log(`seeded ${count} lodgings (replaced ${slugs.length} resorts)`);
}

interface BoardSeed {
  slug: string;
  brand: string;
  name: string;
  category: keyof typeof BoardCategory;
  boardType?: string | null;
  camber?: string | null;
  shape?: string | null;
  flex?: number | null;
  level?: string | null;
  gender?: string | null;
  sizesCm?: number[];
  year?: number | null;
  priceCents?: number | null;
  priceFromCents?: number | null;
  officialUrl?: string | null;
  buyUrl?: string | null;
  coverImageUrl?: string | null;
  intro?: string | null;
  highlights?: string[];
}

async function seedBoards() {
  const file = join(seedsDir, "boards.json");
  if (!existsSync(file)) {
    console.log("boards.json not found, skipping boards");
    return;
  }
  const boards: BoardSeed[] = JSON.parse(readFileSync(file, "utf8"));
  for (const b of boards) {
    const { slug, category, sizesCm, highlights, ...rest } = b;
    const data = {
      ...rest,
      category: BoardCategory[category],
      sizesCm: sizesCm ?? [],
      highlights: highlights ?? [],
    };
    await prisma.board.upsert({
      where: { slug },
      create: { slug, ...data },
      update: data,
    });
  }
  console.log(`seeded ${boards.length} boards`);
}

async function main() {
  await seedResorts();
  await seedTickets();
  await seedLodgings();
  await seedBoards();
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
