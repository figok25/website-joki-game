import { prisma } from "@/lib/prisma";
import { Rank } from "@prisma/client";
import { PricingManager } from "./pricing-manager";
import { StarRateManager } from "./star-rate-manager";
import { STAR_ELIGIBLE_RANKS } from "@/lib/labels";

export default async function PricingPage() {
  const [tiers, starRates] = await Promise.all([
    prisma.pricingTier.findMany({ orderBy: { price: "asc" } }),
    prisma.starRate.findMany({ orderBy: { pricePerStar: "asc" } }),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <div className="mb-6">
          <h2 className="font-display text-xl font-bold">Kelola Harga Paket Rank</h2>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Ubah harga & estimasi waktu di sini — otomatis update di halaman
            order & landing page.
          </p>
        </div>
        <PricingManager
          initialTiers={tiers.map((t) => ({
            id: t.id,
            fromRank: t.fromRank,
            toRank: t.toRank,
            price: t.price,
            estimatedDays: t.estimatedDays,
            isActive: t.isActive,
          }))}
          rankOptions={Object.values(Rank)}
        />
      </div>

      <div>
        <div className="mb-6">
          <h2 className="font-display text-xl font-bold">Kelola Harga Custom per Bintang</h2>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Hanya berlaku untuk rank Epic ke atas — customer input jumlah bintang, harga dihitung otomatis.
          </p>
        </div>
        <StarRateManager
          initialRates={starRates.map((s) => ({
            id: s.id,
            rank: s.rank,
            pricePerStar: s.pricePerStar,
            isActive: s.isActive,
          }))}
          rankOptions={STAR_ELIGIBLE_RANKS}
        />
      </div>
    </div>
  );
}
