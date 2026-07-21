import Link from "next/link";
import { auth } from "@/auth";
import { NavAuthActions } from "./nav-auth-actions";

const steps = [
  {
    number: "01",
    title: "Pilih Rank Tujuan",
    desc: "Tentukan rank awal & rank tujuan akun kamu, lihat estimasi harga & waktu pengerjaan.",
  },
  {
    number: "02",
    title: "Bayar via Midtrans",
    desc: "Transfer bank, e-wallet, atau QRIS — pembayaran diproses aman lewat Midtrans.",
  },
  {
    number: "03",
    title: "Akun Dijoki",
    desc: "Tim joki mengerjakan akun kamu, pantau progresnya langsung dari dashboard.",
  },
];

const pricingPreview = [
  { from: "Epic", to: "Legend", price: "Rp150.000", days: "2-3 hari" },
  { from: "Legend", to: "Mythic", price: "Rp250.000", days: "3-5 hari" },
  { from: "Mythic", to: "Mythic Honor", price: "Rp350.000", days: "5-7 hari" },
];

const trustPoints = [
  { label: "Akun Aman", desc: "Kredensial dienkripsi, tidak disimpan sembarangan" },
  { label: "Proses Cepat", desc: "Dikerjakan tim berpengalaman, sesuai estimasi" },
  { label: "Support Responsif", desc: "Pantau status pesanan langsung dari dashboard" },
];

export default async function LandingPage() {
  const session = await auth();

  return (
    <main className="min-h-screen">
      {/* Nav */}
      <header
        className="border-b sticky top-0 z-10 backdrop-blur"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "rgba(11,18,32,0.85)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <p className="font-display font-bold text-lg">
            JOKI<span style={{ color: "var(--color-gold)" }}>.ML</span>
          </p>
          <NavAuthActions userName={session?.user?.name} />
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="hidden md:block absolute -right-32 -top-10 w-[600px] h-[600px] opacity-[0.12] pointer-events-none"
          aria-hidden="true"
        >
          <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <path
                key={i}
                d={`M ${i * 50} 400 L ${i * 50 + 35} 400 L ${i * 50 + 70} ${
                  400 - i * 50 - 35
                } L ${i * 50 + 35} ${400 - i * 50 - 70} L ${i * 50} ${
                  400 - i * 50 - 35
                } Z`}
                fill="url(#heroGradient)"
              />
            ))}
            <defs>
              <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F0B429" />
                <stop offset="100%" stopColor="#F0B429" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-24">
          <p
            className="font-display text-sm tracking-[0.3em] uppercase mb-3"
            style={{ color: "var(--color-gold)" }}
          >
            Joki Rank Mobile Legends
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold max-w-2xl leading-tight">
            Naik Rank Cepat, Akun Tetap Aman
          </h1>
          <p
            className="mt-4 max-w-lg text-base"
            style={{ color: "var(--color-text-muted)" }}
          >
            Serahkan proses grinding ke tim joki berpengalaman. Pilih rank
            tujuan, bayar, pantau progresnya — tanpa ribet.
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              href="/register"
              className="px-6 py-3 rounded-md font-semibold text-sm transition"
              style={{ backgroundColor: "var(--color-gold)", color: "#0b1220" }}
            >
              Pesan Sekarang
            </Link>
            <a
              href="#harga"
              className="px-6 py-3 rounded-md font-semibold text-sm border transition"
              style={{ borderColor: "var(--color-border)" }}
            >
              Lihat Harga
            </a>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section
        className="border-y"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-surface)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {trustPoints.map((t) => (
            <div key={t.label}>
              <p className="font-display font-semibold" style={{ color: "var(--color-teal)" }}>
                {t.label}
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                {t.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="font-display text-2xl font-bold mb-10">Cara Kerja</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.number}>
              <p
                className="font-mono-order text-3xl font-bold mb-3"
                style={{ color: "var(--color-gold-dim)" }}
              >
                {s.number}
              </p>
              <p className="font-display font-semibold text-lg">{s.title}</p>
              <p className="text-sm mt-2" style={{ color: "var(--color-text-muted)" }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing preview */}
      <section id="harga" className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="font-display text-2xl font-bold mb-2">Estimasi Harga</h2>
        <p className="text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
          Harga bisa berbeda tergantung kombinasi rank awal & tujuan — cek harga pasti setelah login.
        </p>
        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: "var(--color-border)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-left"
                style={{ backgroundColor: "var(--color-surface)" }}
              >
                <th className="px-5 py-3 font-medium" style={{ color: "var(--color-text-muted)" }}>
                  Dari
                </th>
                <th className="px-5 py-3 font-medium" style={{ color: "var(--color-text-muted)" }}>
                  Ke
                </th>
                <th className="px-5 py-3 font-medium" style={{ color: "var(--color-text-muted)" }}>
                  Estimasi Waktu
                </th>
                <th className="px-5 py-3 font-medium text-right" style={{ color: "var(--color-text-muted)" }}>
                  Harga
                </th>
              </tr>
            </thead>
            <tbody>
              {pricingPreview.map((p, i) => (
                <tr
                  key={i}
                  className="border-t"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <td className="px-5 py-3">{p.from}</td>
                  <td className="px-5 py-3">{p.to}</td>
                  <td className="px-5 py-3" style={{ color: "var(--color-text-muted)" }}>
                    {p.days}
                  </td>
                  <td
                    className="px-5 py-3 text-right font-mono-order"
                    style={{ color: "var(--color-gold)" }}
                  >
                    {p.price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div
          className="max-w-6xl mx-auto px-6 py-8 text-sm"
          style={{ color: "var(--color-text-muted)" }}
        >
          © {new Date().getFullYear()} Joki ML. Layanan tidak berafiliasi dengan Moonton.
        </div>
      </footer>
    </main>
  );
}
