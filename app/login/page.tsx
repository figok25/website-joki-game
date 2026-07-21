"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Email atau password salah");
      return;
    }

    const session = await getSession();
    const role = (session?.user as { role?: string } | undefined)?.role;

    if (role === "ADMIN") {
      router.push("/dashboard");
    } else {
      router.push("/");
    }
    router.refresh();
  }

  return (
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center px-4">
      {/* Motif tangga rank — dekorasi, disembunyikan di mobile */}
      <div
        className="hidden md:block absolute -left-24 bottom-0 w-[520px] h-[520px] opacity-[0.15] pointer-events-none"
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
              fill="url(#goldGradient)"
            />
          ))}
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F0B429" />
              <stop offset="100%" stopColor="#F0B429" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <p
            className="font-display text-sm tracking-[0.3em] uppercase"
            style={{ color: "var(--color-gold)" }}
          >
            Joki Mobile Legends
          </p>
          <h1 className="font-display text-3xl font-bold mt-1">Masuk</h1>
          <p className="text-sm mt-2" style={{ color: "var(--color-text-muted)" }}>
            Lanjutkan perjalanan naik rank kamu
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
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md px-3 py-2 text-sm outline-none border focus:ring-2 transition"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md px-3 py-2 text-sm outline-none border focus:ring-2 transition"
              style={{
                backgroundColor: "var(--color-bg)",
                borderColor: "var(--color-border)",
                color: "var(--color-text)",
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md py-2.5 text-sm font-semibold transition disabled:opacity-60"
            style={{ backgroundColor: "var(--color-gold)", color: "#0b1220" }}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p
          className="text-center text-sm mt-5"
          style={{ color: "var(--color-text-muted)" }}
        >
          Belum punya akun?{" "}
          <Link href="/register" style={{ color: "var(--color-teal)" }}>
            Daftar di sini
          </Link>
        </p>
      </div>
    </main>
  );
}
