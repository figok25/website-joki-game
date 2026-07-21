"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RANK_LABELS } from "@/lib/labels";

type Tier = {
  id: string;
  fromRank: string;
  toRank: string;
  price: number;
  estimatedDays: number;
};

declare global {
  interface Window {
    snap: {
      pay: (token: string, options: Record<string, unknown>) => void;
    };
  }
}

const inputStyle = {
  backgroundColor: "var(--color-bg)",
  borderColor: "var(--color-border)",
  color: "var(--color-text)",
};

export function OrderForm({
  pricingTiers,
  clientKey,
}: {
  pricingTiers: Tier[];
  clientKey: string;
}) {
  const router = useRouter();
  const [tierId, setTierId] = useState(pricingTiers[0]?.id ?? "");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [serverId, setServerId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", clientKey);
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [clientKey]);

  const selectedTier = pricingTiers.find((t) => t.id === tierId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pricingTierId: tierId,
        gameAccountUsername: username,
        gameAccountPassword: password,
        gameAccountServerId: serverId || undefined,
        notes: notes || undefined,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? "Gagal membuat pesanan");
      return;
    }

    window.snap.pay(data.snapToken, {
      onSuccess: () => router.push(`/order/${data.orderId}/success`),
      onPending: () => router.push(`/order/${data.orderId}/success`),
      onError: () => {
        setLoading(false);
        setError("Pembayaran gagal, coba lagi");
      },
      onClose: () => {
        setLoading(false);
        setError("Kamu menutup jendela pembayaran sebelum selesai");
      },
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border p-6 space-y-4"
      style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      {error && (
        <p
          className="text-sm rounded-md px-3 py-2"
          style={{ color: "var(--color-danger)", backgroundColor: "#2a1414" }}
        >
          {error}
        </p>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Paket Rank</label>
        <select
          value={tierId}
          onChange={(e) => setTierId(e.target.value)}
          className="w-full rounded-md px-3 py-2 text-sm outline-none border"
          style={inputStyle}
        >
          {pricingTiers.map((t) => (
            <option key={t.id} value={t.id}>
              {RANK_LABELS[t.fromRank]} → {RANK_LABELS[t.toRank]} (Rp
              {t.price.toLocaleString("id-ID")}, ~{t.estimatedDays} hari)
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Username Akun ML</label>
        <input
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-md px-3 py-2 text-sm outline-none border"
          style={inputStyle}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Password Akun ML</label>
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md px-3 py-2 text-sm outline-none border"
          style={inputStyle}
        />
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          Password disimpan terenkripsi, hanya bisa dibaca sistem saat proses joki berjalan.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Server ID (opsional)</label>
        <input
          value={serverId}
          onChange={(e) => setServerId(e.target.value)}
          className="w-full rounded-md px-3 py-2 text-sm outline-none border"
          style={inputStyle}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Catatan (opsional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full rounded-md px-3 py-2 text-sm outline-none border"
          style={inputStyle}
        />
      </div>

      {selectedTier && (
        <p className="text-sm">
          Total bayar:{" "}
          <span className="font-mono-order font-semibold" style={{ color: "var(--color-gold)" }}>
            Rp{selectedTier.price.toLocaleString("id-ID")}
          </span>
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !selectedTier}
        className="w-full rounded-md py-2.5 text-sm font-semibold transition disabled:opacity-60"
        style={{ backgroundColor: "var(--color-gold)", color: "#0b1220" }}
      >
        {loading ? "Memproses..." : "Bayar Sekarang"}
      </button>
    </form>
  );
}
