import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";
import { snap } from "@/lib/midtrans";

const orderSchema = z.object({
  orderType: z.enum(["PACKAGE", "CUSTOM_STAR"]),
  pricingTierId: z.string().optional(),
  starRateId: z.string().optional(),
  customStars: z.number().int().positive().optional(),
  gameAccountUsername: z.string().min(1, "Username wajib diisi"),
  gameAccountPassword: z.string().min(1, "Password wajib diisi"),
  gameAccountServerId: z.string().optional(),
  customerWhatsapp: z.string().min(8, "Nomor WhatsApp wajib diisi"),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Harus login dulu" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const {
    orderType,
    pricingTierId,
    starRateId,
    customStars,
    gameAccountUsername,
    gameAccountPassword,
    gameAccountServerId,
    customerWhatsapp,
    notes,
  } = parsed.data;

  const userId = (session.user as { id: string }).id;
  const orderNumber = `JOKI-${Date.now()}`;

  let gameId: string;
  let price: number;
  let itemName: string;
  let orderData: Record<string, unknown>;

  if (orderType === "PACKAGE") {
    if (!pricingTierId) {
      return NextResponse.json({ error: "Paket rank wajib dipilih" }, { status: 400 });
    }
    const tier = await prisma.pricingTier.findUnique({
      where: { id: pricingTierId },
      include: { game: true },
    });
    if (!tier || !tier.isActive) {
      return NextResponse.json({ error: "Paket harga tidak ditemukan" }, { status: 404 });
    }
    gameId = tier.gameId;
    price = tier.price;
    itemName = `Joki ${tier.game.name} ${tier.fromRank} -> ${tier.toRank}`;
    orderData = { orderType: "PACKAGE", pricingTierId: tier.id };
  } else {
    if (!starRateId || !customStars) {
      return NextResponse.json(
        { error: "Rank & jumlah bintang wajib diisi" },
        { status: 400 }
      );
    }
    const starRate = await prisma.starRate.findUnique({
      where: { id: starRateId },
      include: { game: true },
    });
    if (!starRate || !starRate.isActive) {
      return NextResponse.json({ error: "Harga custom tidak ditemukan" }, { status: 404 });
    }
    gameId = starRate.gameId;
    price = starRate.pricePerStar * customStars;
    itemName = `Joki ${starRate.game.name} ${starRate.rank} custom (${customStars} bintang)`;
    orderData = {
      orderType: "CUSTOM_STAR",
      starRateId: starRate.id,
      customStars,
      customPricePerStar: starRate.pricePerStar,
    };
  }

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId,
      gameId,
      ...orderData,
      gameAccountUsername,
      gameAccountPasswordEnc: encrypt(gameAccountPassword),
      gameAccountServerId,
      customerWhatsapp,
      notes,
      price,
    },
  });

  const midtransOrderId = `${orderNumber}-${order.id.slice(0, 6)}`;

  try {
    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: price,
      },
      customer_details: {
        first_name: session.user.name ?? "Customer",
        email: session.user.email ?? undefined,
      },
      item_details: [
        {
          id: order.id,
          price,
          quantity: 1,
          name: itemName,
        },
      ],
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        midtransOrderId,
        grossAmount: price,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      snapToken: transaction.token,
    });
  } catch (err) {
    console.error("Midtrans error:", err);
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "FAILED" },
    });
    return NextResponse.json(
      { error: "Gagal membuat transaksi pembayaran" },
      { status: 502 }
    );
  }
}
