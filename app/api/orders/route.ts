import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";
import { snap } from "@/lib/midtrans";

const orderSchema = z.object({
  pricingTierId: z.string(),
  gameAccountUsername: z.string().min(1, "Username wajib diisi"),
  gameAccountPassword: z.string().min(1, "Password wajib diisi"),
  gameAccountServerId: z.string().optional(),
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
    pricingTierId,
    gameAccountUsername,
    gameAccountPassword,
    gameAccountServerId,
    notes,
  } = parsed.data;

  const tier = await prisma.pricingTier.findUnique({
    where: { id: pricingTierId },
    include: { game: true },
  });
  if (!tier || !tier.isActive) {
    return NextResponse.json(
      { error: "Paket harga tidak ditemukan" },
      { status: 404 }
    );
  }

  const userId = (session.user as { id: string }).id;
  const orderNumber = `JOKI-${Date.now()}`;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId,
      gameId: tier.gameId,
      pricingTierId: tier.id,
      gameAccountUsername,
      gameAccountPasswordEnc: encrypt(gameAccountPassword),
      gameAccountServerId,
      notes,
      price: tier.price,
    },
  });

  const midtransOrderId = `${orderNumber}-${order.id.slice(0, 6)}`;

  try {
    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: tier.price,
      },
      customer_details: {
        first_name: session.user.name ?? "Customer",
        email: session.user.email ?? undefined,
      },
      item_details: [
        {
          id: tier.id,
          price: tier.price,
          quantity: 1,
          name: `Joki ${tier.game.name} ${tier.fromRank} -> ${tier.toRank}`,
        },
      ],
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        midtransOrderId,
        grossAmount: tier.price,
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
    // Order tetap dibuat, tapi tandai gagal supaya tidak jadi entri "hantu"
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
