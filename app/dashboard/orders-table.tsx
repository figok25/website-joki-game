"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RANK_LABELS, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/labels";

type OrderRow = {
  id: string;
  orderNumber: string;
  userName: string | null;
  userEmail: string;
  fromRank: string;
  toRank: string;
  status: string;
  paymentStatus: string | null;
  price: number;
};

const ORDER_STATUSES = [
  "PENDING_PAYMENT",
  "PAID",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "FAILED",
];
const PAYMENT_STATUSES = ["PENDING", "SETTLEMENT", "EXPIRE", "CANCEL", "DENY", "REFUND"];

const selectStyle = {
  backgroundColor: "var(--color-bg)",
  borderColor: "var(--color-border)",
  color: "var(--color-text)",
};

export function OrdersTable({ orders }: { orders: OrderRow[] }) {
  const router = useRouter();
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function handleCheckStatus(id: string) {
    setCheckingId(id);
    setMessage("");
    const res = await fetch(`/api/admin/orders/${id}/check-status`, {
      method: "POST",
    });
    const data = await res.json();
    setCheckingId(null);
    if (res.ok) {
      setMessage("Status berhasil disinkronkan dari Midtrans");
      router.refresh();
    } else {
      setMessage(data.error ?? "Gagal cek status");
    }
  }

  async function handleManualUpdate(
    id: string,
    field: "status" | "paymentStatus",
    value: string
  ) {
    setMessage("");
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      setMessage(data.error ?? "Gagal update");
    }
  }

  return (
    <div className="space-y-4">
      {message && (
        <p
          className="text-sm rounded-md px-3 py-2"
          style={{ color: "var(--color-teal)", backgroundColor: "var(--color-surface)" }}
        >
          {message}
        </p>
      )}
      <div className="rounded-xl border overflow-x-auto" style={{ borderColor: "var(--color-border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "var(--color-surface)" }}>
              <th className="px-4 py-3 text-left whitespace-nowrap" style={{ color: "var(--color-text-muted)" }}>No. Order</th>
              <th className="px-4 py-3 text-left whitespace-nowrap" style={{ color: "var(--color-text-muted)" }}>Customer</th>
              <th className="px-4 py-3 text-left whitespace-nowrap" style={{ color: "var(--color-text-muted)" }}>Rank</th>
              <th className="px-4 py-3 text-left whitespace-nowrap" style={{ color: "var(--color-text-muted)" }}>Status Pesanan</th>
              <th className="px-4 py-3 text-left whitespace-nowrap" style={{ color: "var(--color-text-muted)" }}>Status Bayar</th>
              <th className="px-4 py-3 text-right whitespace-nowrap" style={{ color: "var(--color-text-muted)" }}>Harga</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t align-top" style={{ borderColor: "var(--color-border)" }}>
                <td className="px-4 py-3 font-mono-order whitespace-nowrap">{o.orderNumber}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {o.userName}{" "}
                  <span style={{ color: "var(--color-text-muted)" }}>({o.userEmail})</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {RANK_LABELS[o.fromRank]} → {RANK_LABELS[o.toRank]}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={o.status}
                    onChange={(e) => handleManualUpdate(o.id, "status", e.target.value)}
                    className="rounded-md px-2 py-1.5 text-xs outline-none border"
                    style={selectStyle}
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {ORDER_STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  {o.paymentStatus ? (
                    <select
                      value={o.paymentStatus}
                      onChange={(e) =>
                        handleManualUpdate(o.id, "paymentStatus", e.target.value)
                      }
                      className="rounded-md px-2 py-1.5 text-xs outline-none border"
                      style={selectStyle}
                    >
                      {PAYMENT_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {PAYMENT_STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span style={{ color: "var(--color-text-muted)" }}>-</span>
                  )}
                </td>
                <td
                  className="px-4 py-3 text-right font-mono-order whitespace-nowrap"
                  style={{ color: "var(--color-gold)" }}
                >
                  Rp{o.price.toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleCheckStatus(o.id)}
                    disabled={checkingId === o.id}
                    className="text-xs px-3 py-1.5 rounded-md font-semibold whitespace-nowrap"
                    style={{ backgroundColor: "var(--color-teal)", color: "#0b1220" }}
                  >
                    {checkingId === o.id ? "Mengecek..." : "Cek Otomatis"}
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center" style={{ color: "var(--color-text-muted)" }}>
                  Belum ada pesanan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
        "Cek Otomatis" menanyakan status transaksi langsung ke Midtrans (berguna kalau webhook belum sempat masuk).
        Dropdown status bisa diubah manual kapan saja — misalnya kalau ada transfer bank yang konfirmasinya lambat.
      </p>
    </div>
  );
}
