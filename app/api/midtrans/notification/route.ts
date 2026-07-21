import { NextResponse } from "next/server";
import { coreApi } from "@/lib/midtrans";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  const statusResponse = await coreApi.transaction.notification(body);
  const { order_id, transaction_status, fraud_status, payment_type, transaction_id } =
    statusResponse;

  const payment = await prisma.payment.findUnique({
    where: { midtransOrderId: order_id },
  });
  if (!payment) {
    return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
  }

  let paymentStatus:
    | "PENDING"
    | "SETTLEMENT"
    | "EXPIRE"
    | "CANCEL"
    | "DENY"
    | "REFUND" = "PENDING";
  let orderStatus:
    | "PENDING_PAYMENT"
    | "PAID"
    | "CANCELLED"
    | "FAILED" = "PENDING_PAYMENT";

  if (transaction_status === "capture" || transaction_status === "settlement") {
    if (fraud_status === "accept" || !fraud_status) {
      paymentStatus = "SETTLEMENT";
      orderStatus = "PAID";
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
    where: { id: payment.id },
    data: {
      status: paymentStatus,
      transactionId: transaction_id,
      paymentType: payment_type,
      rawResponse: statusResponse as unknown as object,
    },
  });

  await prisma.order.update({
    where: { id: payment.orderId },
    data: { status: orderStatus },
  });

  return NextResponse.json({ received: true });
}
