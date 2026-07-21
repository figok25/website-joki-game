"use client";

import { useState } from "react";
import { RANK_LABELS } from "@/lib/labels";

type Tier = {
  id: string;
  fromRank: string;
  toRank: string;
  price: number;
  estimatedDays: number;
  isActive: boolean;
};

const inputStyle = {
  backgroundColor: "var(--color-bg)",
  borderColor: "var(--color-border)",
  color: "var(--color-text)",
};

export function PricingManager({
  initialTiers,
  rankOptions,
}: {
  initialTiers: Tier[];
  rankOptions: string[];
}) {
  const [tiers, setTiers] = useState(initialTiers);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const [newFrom, setNewFrom] = useState(rankOptions[0]);
  const [newTo, setNewTo] = useState(rankOptions[1] ?? rankOptions[0]);
  const [newPrice, setNewPrice] = useState("");
  const [newDays, setNewDays] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  function updateLocal(id: string, patch: Partial<Tier>) {
    setTiers((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  async function handleSave(tier: Tier) {
    setSavingId(tier.id);
    setMessage("");
    const res = await fetch(`/api/admin/pricing-tiers/${tier.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        price: tier.price,
        estimatedDays: tier.estimatedDays,
        isActive: tier.isActive,
      }),
    });
    setSavingId(null);
    if (res.ok) {
      setMessage(
        `Tersimpan: ${RANK_LABELS[tier.fromRank]} → ${RANK_LABELS[tier.toRank]}`
      );
    } else {
      const data = await res.json();
      setMessage(data.error ?? "Gagal menyimpan");
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    if (!newPrice || !newDays) {
      setCreateError("Harga & estimasi hari wajib diisi");
      return;
    }
    setCreating(true);
    const res = await fetch("/api/admin/pricing-tiers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromRank: newFrom,
        toRank: newTo,
        price: Number(newPrice),
        estimatedDays: Number(newDays),
      }),
    });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) {
      setCreateError(data.error ?? "Gagal menambah paket");
      return;
    }
    setTiers((prev) => [...prev, data.tier]);
    setNewPrice("");
    setNewDays("");
  }

  return (
    <div className="space-y-8">
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
              <th className="px-4 py-3 text-left" style={{ color: "var(--color-text-muted)" }}>Dari</th>
              <th className="px-4 py-3 text-left" style={{ color: "var(--color-text-muted)" }}>Ke</th>
              <th className="px-4 py-3 text-left" style={{ color: "var(--color-text-muted)" }}>Harga (Rp)</th>
              <th className="px-4 py-3 text-left" style={{ color: "var(--color-text-muted)" }}>Estimasi (hari)</th>
              <th className="px-4 py-3 text-left" style={{ color: "var(--color-text-muted)" }}>Aktif</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((t) => (
              <tr key={t.id} className="border-t" style={{ borderColor: "var(--color-border)" }}>
                <td className="px-4 py-3 whitespace-nowrap">{RANK_LABELS[t.fromRank]}</td>
                <td className="px-4 py-3 whitespace-nowrap">{RANK_LABELS[t.toRank]}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={t.price}
                    onChange={(e) => updateLocal(t.id, { price: Number(e.target.value) })}
                    className="w-28 rounded-md px-2 py-1 text-sm outline-none border"
                    style={inputStyle}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={t.estimatedDays}
                    onChange={(e) => updateLocal(t.id, { estimatedDays: Number(e.target.value) })}
                    className="w-20 rounded-md px-2 py-1 text-sm outline-none border"
                    style={inputStyle}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={t.isActive}
                    onChange={(e) => updateLocal(t.id, { isActive: e.target.checked })}
                  />
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleSave(t)}
                    disabled={savingId === t.id}
                    className="text-xs px-3 py-1.5 rounded-md font-semibold"
                    style={{ backgroundColor: "var(--color-gold)", color: "#0b1220" }}
                  >
                    {savingId === t.id ? "..." : "Simpan"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        className="rounded-xl border p-6"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
      >
        <h3 className="font-display font-semibold mb-4">Tambah Paket Baru</h3>
        {createError && (
          <p
            className="text-sm rounded-md px-3 py-2 mb-4"
            style={{ color: "var(--color-danger)", backgroundColor: "#2a1414" }}
          >
            {createError}
          </p>
        )}
        <form onSubmit={handleCreate} className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-xs" style={{ color: "var(--color-text-muted)" }}>Dari</label>
            <select
              value={newFrom}
              onChange={(e) => setNewFrom(e.target.value)}
              className="w-full rounded-md px-2 py-2 text-sm outline-none border"
              style={inputStyle}
            >
              {rankOptions.map((r) => (
                <option key={r} value={r}>{RANK_LABELS[r]}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs" style={{ color: "var(--color-text-muted)" }}>Ke</label>
            <select
              value={newTo}
              onChange={(e) => setNewTo(e.target.value)}
              className="w-full rounded-md px-2 py-2 text-sm outline-none border"
              style={inputStyle}
            >
              {rankOptions.map((r) => (
                <option key={r} value={r}>{RANK_LABELS[r]}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs" style={{ color: "var(--color-text-muted)" }}>Harga (Rp)</label>
            <input
              type="number"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="w-full rounded-md px-2 py-2 text-sm outline-none border"
              style={inputStyle}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs" style={{ color: "var(--color-text-muted)" }}>Estimasi (hari)</label>
            <input
              type="number"
              value={newDays}
              onChange={(e) => setNewDays(e.target.value)}
              className="w-full rounded-md px-2 py-2 text-sm outline-none border"
              style={inputStyle}
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="col-span-2 md:col-span-4 rounded-md py-2.5 text-sm font-semibold"
            style={{ backgroundColor: "var(--color-teal)", color: "#0b1220" }}
          >
            {creating ? "Menambahkan..." : "Tambah Paket"}
          </button>
        </form>
      </div>
    </div>
  );
}
