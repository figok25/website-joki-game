"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RANK_LABELS, STAR_ELIGIBLE_RANKS } from "@/lib/labels";

type Tier = {
  id: string;
  fromRank: string;
  toRank: string;
  price: number;
  estimatedDays: number;
};

type StarRate = {
  id: string;
  rank: string;
  pricePerStar: number;
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
  starRates,
  clientKey,
}: {
  pricingTiers: Tier[];
  starRates: StarRate[];
  clientKey: string;
}) {
  const router = useRouter();
  const [orderType, setOrderType] = useState<"PACKAGE" | "CUSTOM_STAR">("PACKAGE");

  const [tierId, setTierId] = useState(pricingTiers[0]?.id ?? "");
  const [starRateId, setStarRateId] = useState(starRates[0]?.id ?? "");
  const [stars, setStars] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
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
  const selectedStarRate = starRates.find((s) => s.id === starRateId);
  const starsNum = Number(stars) || 0;
  const customTotal = selectedStarRate ? selectedStarRate.pricePerStar * starsNum : 0;

  const totalPrice = orderType === "PACKAGE" ? selectedTier?.price ?? 0 : customTotal;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (orderType === "CUSTOM_STAR" && starsNum <= 0) {
      setError("Jumlah bintang harus lebih dari 0");
      return;
    }

    setLoading(true);

    const body =
      orderType === "PACKAGE"
        ? {
            orderType,
            pricingTierId: tierId,
            gameAccountUsername: username,
            gameAccountPassword: password,
            gameAccountServerId: serverId || undefined,
            customerWhatsapp: whatsapp,
            notes: notes || undefined,
          }
        : {
            orderType,
            starRateId,
            customStars: starsNum,
            gameAccountUsername: username,
            gameAccountPassword: password,
            gameAccountServerId: serverId || undefined,
            customerWhatsapp: whatsapp,
            notes: notes || undefined,
          };

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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

      {/* Toggle tipe order */}
      <div className="flex rounded-md border overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
        <button
          type="button"
          onClick={() => setOrderType("PACKAGE")}
          className="flex-1 text-sm py-2 font-semibold transition"
          style={{
            backgroundColor: orderType === "PACKAGE" ? "var(--color-gold)" : "transparent",
            color: orderType === "PACKAGE" ? "#0b1220" : "var(--color-text-muted)",
          }}
        >
          Paket Rank
        </button>
        <button
          type="button"
          onClick={() => setOrderType("CUSTOM_STAR")}
          className="flex-1 text-sm py-2 font-semibold transition"
          style={{
            backgroundColor: orderType === "CUSTOM_STAR" ? "var(--color-gold)" : "transparent",
            color: orderType === "CUSTOM_STAR" ? "#0b1220" : "var(--color-text-muted)",
          }}
        >
          Custom per Bintang
        </button>
      </div>

      {orderType === "PACKAGE" ? (
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
      ) : (
        <>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Rank</label>
            <select
              value={starRateId}
              onChange={(e) => setStarRateId(e.target.value)}
              className="w-full rounded-md px-3 py-2 text-sm outline-none border"
              style={inputStyle}
            >
              {starRates.map((s) => (
                <option key={s.id} value={s.id}>
                  {RANK_LABELS[s.rank]} (Rp{s.pricePerStar.toLocaleString("id-ID")}/bintang)
                </option>
              ))}
            </select>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Hanya tersedia untuk rank {STAR_ELIGIBLE_RANKS.map((r) => RANK_LABELS[r]).join(", ")}.
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Jumlah Bintang</label>
            <input
              required
              type="number"
              min={1}
              value={stars}
              onChange={(e) => setStars(e.target.value)}
              placeholder="Contoh: 10"
              className="w-full rounded-md px-3 py-2 text-sm outline-none border"
              style={inputStyle}
            />
          </div>
        </>
      )}

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
        <label className="text-sm font-medium">No WhatsApp Aktif</label>
        <input
          required
          type="tel"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="08xxxxxxxxxx"
          className="w-full rounded-md px-3 py-2 text-sm outline-none border"
          style={inputStyle}
        />
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          Dipakai admin untuk menghubungi kamu soal proses login/verifikasi akun.
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

      {totalPrice > 0 && (
        <p className="text-sm">
          Total bayar:{" "}
          <span className="font-mono-order font-semibold" style={{ color: "var(--color-gold)" }}>
            Rp{totalPrice.toLocaleString("id-ID")}
          </span>
        </p>
      )}

      <button
        type="submit"
        disabled={loading || totalPrice <= 0}
        className="w-full rounded-md py-2.5 text-sm font-semibold transition disabled:opacity-60"
        style={{ backgroundColor: "var(--color-gold)", color: "#0b1220" }}
      >
        {loading ? "Memproses..." : "Bayar Sekarang"}
      </button>
    </form>
  );
}
