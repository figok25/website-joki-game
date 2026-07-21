import { prisma } from "@/lib/prisma";
import { Rank } from "@prisma/client";
import { PricingManager } from "./pricing-manager";

export default async function PricingPage() {
  const tiers = await prisma.pricingTier.findMany({
    orderBy: { price: "asc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-xl font-bold">Kelola Harga Joki</h2>
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
  );
}
