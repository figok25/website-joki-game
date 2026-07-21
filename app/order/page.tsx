import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OrderForm } from "./order-form";

export default async function OrderPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const pricingTiers = await prisma.pricingTier.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
  });

  return (
    <main className="min-h-screen px-4 py-16">
      <div className="max-w-lg mx-auto">
        <p
          className="font-display text-sm tracking-[0.3em] uppercase mb-2"
          style={{ color: "var(--color-gold)" }}
        >
          Pesan Joki
        </p>
        <h1 className="font-display text-3xl font-bold mb-2">
          Mobile Legends Rank Boost
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
          Pilih paket rank, isi data akun, lalu bayar via Midtrans (mode sandbox).
        </p>
        <OrderForm
          pricingTiers={pricingTiers.map((t) => ({
            id: t.id,
            fromRank: t.fromRank,
            toRank: t.toRank,
            price: t.price,
            estimatedDays: t.estimatedDays,
          }))}
          clientKey={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? ""}
        />
      </div>
    </main>
  );
}
