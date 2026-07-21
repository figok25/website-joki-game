import { prisma } from "@/lib/prisma";
import { OrdersTable } from "./orders-table";

export default async function DashboardOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { user: true, pricingTier: true, payment: true },
    orderBy: { createdAt: "desc" },
  });

  const totalRevenue = orders
    .filter((o) => o.status === "PAID" || o.status === "COMPLETED")
    .reduce((sum, o) => sum + o.price, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          {orders.length} pesanan · Total pendapatan (lunas) Rp
          {totalRevenue.toLocaleString("id-ID")}
        </p>
        <a
          href="/api/admin/export"
          className="text-sm px-4 py-2 rounded-md font-semibold"
          style={{ backgroundColor: "var(--color-gold)", color: "#0b1220" }}
        >
          Export ke Excel
        </a>
      </div>

      <OrdersTable
        orders={orders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          userName: o.user.name,
          userEmail: o.user.email,
          fromRank: o.pricingTier.fromRank,
          toRank: o.pricingTier.toRank,
          status: o.status,
          paymentStatus: o.payment?.status ?? null,
          price: o.price,
        }))}
      />
    </div>
  );
}
