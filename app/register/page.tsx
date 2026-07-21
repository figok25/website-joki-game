"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Terjadi kesalahan");
      return;
    }

    router.push("/login");
  }

  return (
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center px-4">
      <div
        className="hidden md:block absolute -right-24 bottom-0 w-[520px] h-[520px] opacity-[0.15] pointer-events-none scale-x-[-1]"
        aria-hidden="true"
      >
        <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path
              key={i}
              d={`M ${i * 60} 400 L ${i * 60 + 40} 400 L ${i * 60 + 80} ${
                400 - i * 60 - 40
              } L ${i * 60 + 40} ${400 - i * 60 - 80} L ${i * 60} ${
                400 - i * 60 - 40
              } Z`}
              fill="url(#tealGradient)"
            />
          ))}
          <defs>
            <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2DD9C4" />
              <stop offset="100%" stopColor="#2DD9C4" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <p
            className="font-display text-sm tracking-[0.3em] uppercase"
            style={{ color: "var(--color-teal)" }}
          >
            Joki Mobile Legends
          </p>
          <h1 className="font-display text-3xl font-bold mt-1">Daftar Akun</h1>
          <p className="text-sm mt-2" style={{ color: "var(--color-text-muted)" }}>
            Mulai perjalanan naik rank kamu
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border p-6 space-y-4"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
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
            <label htmlFor="name" className="text-sm font-medium">
              Nama
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md px-3 py-2 text-sm outline-none border"
              style={{
                backgroundColor: "var(--color-bg)",
                borderColor: "var(--color-border)",
                color: "var(--color-text)",
              }}
              placeholder="Nama kamu"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md px-3 py-2 text-sm outline-none border"
              style={{
                backgroundColor: "var(--color-bg)",
                borderColor: "var(--color-border)",
                color: "var(--color-text)",
              }}
              placeholder="nama@email.com"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md px-3 py-2 text-sm outline-none border"
              style={{
                backgroundColor: "var(--color-bg)",
                borderColor: "var(--color-border)",
                color: "var(--color-text)",
              }}
              placeholder="Minimal 8 karakter"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md py-2.5 text-sm font-semibold transition disabled:opacity-60"
            style={{ backgroundColor: "var(--color-teal)", color: "#0b1220" }}
          >
            {loading ? "Memproses..." : "Daftar"}
          </button>
        </form>

        <p
          className="text-center text-sm mt-5"
          style={{ color: "var(--color-text-muted)" }}
        >
          Sudah punya akun?{" "}
          <Link href="/login" style={{ color: "var(--color-gold)" }}>
            Masuk
          </Link>
        </p>
      </div>
    </main>
  );
}
