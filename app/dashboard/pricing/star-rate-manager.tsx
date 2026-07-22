"use client";

import { useState } from "react";
import { RANK_LABELS } from "@/lib/labels";

type StarRateRow = {
  id: string;
  rank: string;
  pricePerStar: number;
  isActive: boolean;
};

const inputStyle = {
  backgroundColor: "var(--color-bg)",
  borderColor: "var(--color-border)",
  color: "var(--color-text)",
};

export function StarRateManager({
  initialRates,
}: {
  initialRates: StarRateRow[];
  rankOptions: string[];
}) {
  const [rates, setRates] = useState(initialRates);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  function updateLocal(id: string, patch: Partial<StarRateRow>) {
    setRates((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  async function handleSave(rate: StarRateRow) {
    setSavingId(rate.id);
    setMessage("");
    const res = await fetch(`/api/admin/star-rates/${rate.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pricePerStar: rate.pricePerStar,
        isActive: rate.isActive,
      }),
    });
    setSavingId(null);
    if (res.ok) {
      setMessage(`Tersimpan: ${RANK_LABELS[rate.rank]}`);
    } else {
      const data = await res.json();
      setMessage(data.error ?? "Gagal menyimpan");
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
              <th className="px-4 py-3 text-left" style={{ color: "var(--color-text-muted)" }}>Rank</th>
              <th className="px-4 py-3 text-left" style={{ color: "var(--color-text-muted)" }}>Harga per Bintang (Rp)</th>
              <th className="px-4 py-3 text-left" style={{ color: "var(--color-text-muted)" }}>Aktif</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rates.map((r) => (
              <tr key={r.id} className="border-t" style={{ borderColor: "var(--color-border)" }}>
                <td className="px-4 py-3 whitespace-nowrap">{RANK_LABELS[r.rank]}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={r.pricePerStar}
                    onChange={(e) => updateLocal(r.id, { pricePerStar: Number(e.target.value) })}
                    className="w-32 rounded-md px-2 py-1 text-sm outline-none border"
                    style={inputStyle}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={r.isActive}
                    onChange={(e) => updateLocal(r.id, { isActive: e.target.checked })}
                  />
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleSave(r)}
                    disabled={savingId === r.id}
                    className="text-xs px-3 py-1.5 rounded-md font-semibold"
                    style={{ backgroundColor: "var(--color-gold)", color: "#0b1220" }}
                  >
                    {savingId === r.id ? "..." : "Simpan"}
                  </button>
                </td>
              </tr>
            ))}
            {rates.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center" style={{ color: "var(--color-text-muted)" }}>
                  Belum ada data — jalankan seeder dulu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
