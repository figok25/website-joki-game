import ExcelJS from "exceljs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return new Response("Forbidden", { status: 403 });
  }

  const orders = await prisma.order.findMany({
    include: {
      user: true,
      pricingTier: { include: { game: true } },
      starRate: { include: { game: true } },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Penjualan Joki");

  sheet.columns = [
    { header: "No. Order", key: "orderNumber", width: 24 },
    { header: "Tanggal", key: "date", width: 18 },
    { header: "Customer", key: "customer", width: 24 },
    { header: "Email", key: "email", width: 28 },
    { header: "Game", key: "game", width: 16 },
    { header: "Tipe Order", key: "orderType", width: 16 },
    { header: "Rank Awal", key: "fromRank", width: 16 },
    { header: "Rank Tujuan", key: "toRank", width: 16 },
    { header: "Jumlah Bintang", key: "stars", width: 14 },
    { header: "Status Pesanan", key: "status", width: 16 },
    { header: "Status Bayar", key: "paymentStatus", width: 16 },
    { header: "Metode Bayar", key: "paymentType", width: 16 },
    { header: "Harga (Rp)", key: "price", width: 16 },
  ];

  sheet.getRow(1).font = { bold: true };

  for (const o of orders) {
    const isCustom = o.orderType === "CUSTOM_STAR";
    sheet.addRow({
      orderNumber: o.orderNumber,
      date: o.createdAt.toLocaleDateString("id-ID"),
      customer: o.user.name,
      email: o.user.email,
      game: (o.pricingTier?.game ?? o.starRate?.game)?.name ?? "-",
      orderType: isCustom ? "Custom per Bintang" : "Paket Rank",
      fromRank: isCustom ? "-" : o.pricingTier?.fromRank ?? "-",
      toRank: isCustom ? (o.starRate?.rank ?? "-") : o.pricingTier?.toRank ?? "-",
      stars: isCustom ? o.customStars ?? "-" : "-",
      status: o.status,
      paymentStatus: o.payment?.status ?? "-",
      paymentType: o.payment?.paymentType ?? "-",
      price: o.price,
    });
  }

  const totalRevenue = orders
    .filter((o) => o.status === "PAID" || o.status === "COMPLETED")
    .reduce((sum, o) => sum + o.price, 0);

  sheet.addRow({});
  const totalRow = sheet.addRow({
    status: "TOTAL PENDAPATAN (lunas)",
    price: totalRevenue,
  });
  totalRow.font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="laporan-penjualan-${Date.now()}.xlsx"`,
    },
  });
}
