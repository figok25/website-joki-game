import { PrismaClient, Rank, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ===== Admin user =====
  // PENTING: ganti password ini setelah login pertama kali!
  const adminEmail = "admin@jokiml.test";
  const adminPassword = "Admin12345";
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Admin",
      email: adminEmail,
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  // ===== Game: Mobile Legends =====
  const game = await prisma.game.upsert({
    where: { slug: "mobile-legends" },
    update: {},
    create: {
      name: "Mobile Legends",
      slug: "mobile-legends",
    },
  });

  // ===== Pricing tiers contoh (edit sesuai harga asli kamu nanti) =====
  const tiers: { from: Rank; to: Rank; price: number; days: number }[] = [
    { from: Rank.WARRIOR, to: Rank.ELITE, price: 30000, days: 1 },
    { from: Rank.ELITE, to: Rank.MASTER, price: 50000, days: 1 },
    { from: Rank.MASTER, to: Rank.GRANDMASTER, price: 70000, days: 2 },
    { from: Rank.GRANDMASTER, to: Rank.EPIC, price: 100000, days: 2 },
    { from: Rank.EPIC, to: Rank.LEGEND, price: 150000, days: 3 },
    { from: Rank.LEGEND, to: Rank.MYTHIC, price: 250000, days: 4 },
    { from: Rank.MYTHIC, to: Rank.MYTHIC_HONOR, price: 350000, days: 6 },
    { from: Rank.MYTHIC_HONOR, to: Rank.MYTHIC_GLORY, price: 500000, days: 8 },
  ];

  for (const t of tiers) {
    await prisma.pricingTier.upsert({
      where: {
        gameId_fromRank_toRank: {
          gameId: game.id,
          fromRank: t.from,
          toRank: t.to,
        },
      },
      update: { price: t.price, estimatedDays: t.days },
      create: {
        gameId: game.id,
        fromRank: t.from,
        toRank: t.to,
        price: t.price,
        estimatedDays: t.days,
      },
    });
  }

  console.log("Seed selesai.");
  console.log(`Login admin -> email: ${adminEmail} | password: ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
