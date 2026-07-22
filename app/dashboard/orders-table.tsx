"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RANK_LABELS, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/labels";

type OrderRow = {
  id: string;
  orderNumber: string;
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
  const [deletingId, setDeletingId] = useState<string | null>(null);
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

  async function handleDelete(id: string, orderNumber: string) {
    const confirmed = window.confirm(
      `Hapus pesanan ${orderNumber}? Tindakan ini tidak bisa dibatalkan.`
    );
    if (!confirmed) return;

    setDeletingId(id);
    setMessage("");
    const res = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (res.ok) {
      setMessage(`Pesanan ${orderNumber} dihapus`);
      router.refresh();
    } else {
      const data = await res.json();
      setMessage(data.error ?? "Gagal menghapus pesanan");
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

      {/* Desktop: table */}
      <div
        className="hidden md:block rounded-xl border overflow-hidden"
        style={{ borderColor: "var(--color-border)" }}
      >
        <table className="w-full text-sm table-fixed">
          <thead>
            <tr style={{ backgroundColor: "var(--color-surface)" }}>
              <th className="px-3 py-3 text-left w-[15%]" style={{ color: "var(--color-text-muted)" }}>No. Order</th>
              <th className="px-3 py-3 text-left w-[15%]" style={{ color: "var(--color-text-muted)" }}>Rank</th>
              <th className="px-3 py-3 text-left w-[17%]" style={{ color: "var(--color-text-muted)" }}>Status Pesanan</th>
              <th className="px-3 py-3 text-left w-[15%]" style={{ color: "var(--color-text-muted)" }}>Status Bayar</th>
              <th className="px-3 py-3 text-right w-[13%]" style={{ color: "var(--color-text-muted)" }}>Harga</th>
              <th className="px-3 py-3 w-[25%]"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t" style={{ borderColor: "var(--color-border)" }}>
                <td className="px-3 py-3 font-mono-order text-xs truncate">{o.orderNumber}</td>
                <td className="px-3 py-3 text-xs">
                  {RANK_LABELS[o.fromRank]} → {RANK_LABELS[o.toRank]}
                </td>
                <td className="px-3 py-3">
                  <select
                    value={o.status}
                    onChange={(e) => handleManualUpdate(o.id, "status", e.target.value)}
                    className="w-full rounded-md px-2 py-1.5 text-xs outline-none border"
                    style={selectStyle}
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {ORDER_STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-3">
                  {o.paymentStatus ? (
                    <select
                      value={o.paymentStatus}
                      onChange={(e) =>
                        handleManualUpdate(o.id, "paymentStatus", e.target.value)
                      }
                      className="w-full rounded-md px-2 py-1.5 text-xs outline-none border"
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
                  className="px-3 py-3 text-right font-mono-order text-xs"
                  style={{ color: "var(--color-gold)" }}
                >
                  Rp{o.price.toLocaleString("id-ID")}
                </td>
                <td className="px-3 py-3">
                  <div className="flex gap-1.5 justify-end">
                    <button
                      onClick={() => handleCheckStatus(o.id)}
                      disabled={checkingId === o.id}
                      className="text-xs px-2.5 py-1.5 rounded-md font-semibold whitespace-nowrap"
                      style={{ backgroundColor: "var(--color-teal)", color: "#0b1220" }}
                    >
                      {checkingId === o.id ? "..." : "Cek Otomatis"}
                    </button>
                    <button
                      onClick={() => handleDelete(o.id, o.orderNumber)}
                      disabled={deletingId === o.id}
                      className="text-xs px-2.5 py-1.5 rounded-md font-semibold whitespace-nowrap"
                      style={{ color: "var(--color-danger)", border: "1px solid var(--color-danger)" }}
                    >
                      {deletingId === o.id ? "..." : "Hapus"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center" style={{ color: "var(--color-text-muted)" }}>
                  Belum ada pesanan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards */}
      <div className="md:hidden space-y-3">
        {orders.map((o) => (
          <div
            key={o.id}
            className="rounded-xl border p-4 space-y-3"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
          >
            <div className="flex items-center justify-between">
              <p className="font-mono-order text-xs" style={{ color: "var(--color-text-muted)" }}>
                {o.orderNumber}
              </p>
              <p className="font-mono-order text-sm font-semibold" style={{ color: "var(--color-gold)" }}>
                Rp{o.price.toLocaleString("id-ID")}
              </p>
            </div>
            <p className="text-sm">{RANK_LABELS[o.fromRank]} → {RANK_LABELS[o.toRank]}</p>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={o.status}
                onChange={(e) => handleManualUpdate(o.id, "status", e.target.value)}
                className="w-full rounded-md px-2 py-1.5 text-xs outline-none border"
                style={selectStyle}
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                ))}
              </select>
              {o.paymentStatus ? (
                <select
                  value={o.paymentStatus}
                  onChange={(e) => handleManualUpdate(o.id, "paymentStatus", e.target.value)}
                  className="w-full rounded-md px-2 py-1.5 text-xs outline-none border"
                  style={selectStyle}
                >
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>{PAYMENT_STATUS_LABELS[s]}</option>
                  ))}
                </select>
              ) : (
                <span className="text-xs self-center" style={{ color: "var(--color-text-muted)" }}>-</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleCheckStatus(o.id)}
                disabled={checkingId === o.id}
                className="flex-1 text-xs px-2.5 py-2 rounded-md font-semibold"
                style={{ backgroundColor: "var(--color-teal)", color: "#0b1220" }}
              >
                {checkingId === o.id ? "..." : "Cek Otomatis"}
              </button>
              <button
                onClick={() => handleDelete(o.id, o.orderNumber)}
                disabled={deletingId === o.id}
                className="flex-1 text-xs px-2.5 py-2 rounded-md font-semibold"
                style={{ color: "var(--color-danger)", border: "1px solid var(--color-danger)" }}
              >
                {deletingId === o.id ? "..." : "Hapus"}
              </button>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <p className="text-center py-8 text-sm" style={{ color: "var(--color-text-muted)" }}>
            Belum ada pesanan
          </p>
        )}
      </div>

      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
        Detail akun & kontak WhatsApp customer ada di tab "Pesanan Detail".
      </p>
    </div>
  );
}
