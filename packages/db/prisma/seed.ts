import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient, TicketType, DayType, Channel, LodgingType } from "@prisma/client";

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
    const { slug, ...data } = r;
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
}

async function seedLodgings() {
  const file = join(seedsDir, "lodgings.json");
  if (!existsSync(file)) {
    console.log("lodgings.json not found, skipping lodgings");
    return;
  }
  const lodgings: LodgingSeed[] = JSON.parse(readFileSync(file, "utf8"));
  let count = 0;
  for (const l of lodgings) {
    const resort = await prisma.resort.findUnique({ where: { slug: l.resortSlug } });
    if (!resort) {
      console.warn(`unknown resort slug in lodgings.json: ${l.resortSlug}`);
      continue;
    }
    const data = {
      type: LodgingType[l.type],
      distanceToResortM: l.distanceToResortM ?? null,
      isSkiInOut: l.isSkiInOut ?? false,
      address: l.address ?? null,
      externalRefs: l.links ?? {},
    };
    const existing = await prisma.lodging.findFirst({
      where: { resortId: resort.id, name: l.name },
    });
    if (existing) {
      await prisma.lodging.update({ where: { id: existing.id }, data });
    } else {
      await prisma.lodging.create({ data: { resortId: resort.id, name: l.name, ...data } });
    }
    count += 1;
  }
  console.log(`seeded ${count} lodgings`);
}

async function main() {
  await seedResorts();
  await seedTickets();
  await seedLodgings();
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
