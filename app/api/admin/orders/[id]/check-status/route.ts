import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { coreApi } from "@/lib/midtrans";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { payment: true },
  });
  if (!order || !order.payment) {
    return NextResponse.json(
      { error: "Pesanan/pembayaran tidak ditemukan" },
      { status: 404 }
    );
  }

  try {
    const statusResponse = await coreApi.transaction.status(
      order.payment.midtransOrderId
    );
    const { transaction_status, fraud_status, payment_type, transaction_id } =
      statusResponse;

    let paymentStatus = order.payment.status;
    let orderStatus = order.status;

    if (transaction_status === "capture" || transaction_status === "settlement") {
      if (fraud_status === "accept" || !fraud_status) {
        paymentStatus = "SETTLEMENT";
        // Jangan timpa kalau admin sudah set manual ke IN_PROGRESS/COMPLETED
        if (order.status === "PENDING_PAYMENT") {
          orderStatus = "PAID";
        }
      }
    } else if (transaction_status === "pending") {
      paymentStatus = "PENDING";
    } else if (transaction_status === "deny") {
      paymentStatus = "DENY";
      orderStatus = "FAILED";
    } else if (transaction_status === "cancel") {
      paymentStatus = "CANCEL";
      orderStatus = "CANCELLED";
    } else if (transaction_status === "expire") {
      paymentStatus = "EXPIRE";
      orderStatus = "FAILED";
    }

    await prisma.payment.update({
      where: { id: order.payment.id },
      data: {
        status: paymentStatus,
        transactionId: transaction_id,
        paymentType: payment_type,
        rawResponse: statusResponse as unknown as object,
      },
    });

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: orderStatus },
    });

    return NextResponse.json({ paymentStatus, orderStatus: updated.status });
  } catch (err) {
    console.error("Check status error:", err);
    return NextResponse.json(
      { error: "Gagal cek status ke Midtrans (mungkin transaksi belum pernah dibuat di sana)" },
      { status: 502 }
    );
  }
}
