import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { RANK_LABELS, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/labels";

export default async function MyOrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;

  const orders = await prisma.order.findMany({
    where: { userId },
    include: { pricingTier: true, starRate: true, payment: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <p
          className="font-display text-sm tracking-[0.3em] uppercase mb-2"
          style={{ color: "var(--color-gold)" }}
        >
          Riwayat
        </p>
        <h1 className="font-display text-3xl font-bold mb-8">Pesanan Saya</h1>

        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className="rounded-xl border p-5"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-surface)",
              }}
            >
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <p className="font-mono-order text-sm" style={{ color: "var(--color-text-muted)" }}>
                    {o.orderNumber}
                  </p>
                  <p className="font-display font-semibold mt-1">
                    {o.orderType === "CUSTOM_STAR" && o.starRate
                      ? `${RANK_LABELS[o.starRate.rank]} (custom, ${o.customStars ?? 0} bintang)`
                      : o.pricingTier
                        ? `${RANK_LABELS[o.pricingTier.fromRank]} → ${RANK_LABELS[o.pricingTier.toRank]}`
                        : "-"}
                  </p>
                </div>
                <p className="font-mono-order font-semibold" style={{ color: "var(--color-gold)" }}>
                  Rp{o.price.toLocaleString("id-ID")}
                </p>
              </div>
              <div className="flex items-center gap-4 mt-3 text-sm flex-wrap">
                <span>
                  <span style={{ color: "var(--color-text-muted)" }}>Status: </span>
                  {ORDER_STATUS_LABELS[o.status]}
                </span>
                <span>
                  <span style={{ color: "var(--color-text-muted)" }}>Bayar: </span>
                  {o.payment ? PAYMENT_STATUS_LABELS[o.payment.status] : "-"}
                </span>
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <p style={{ color: "var(--color-text-muted)" }}>
              Kamu belum punya pesanan.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
