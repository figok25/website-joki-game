import Link from "next/link";

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;

  return (
    <main className="min-h-screen flex items-center justify-center px-4 text-center">
      <div className="max-w-sm">
        <p
          className="font-display text-sm tracking-[0.3em] uppercase mb-2"
          style={{ color: "var(--color-gold)" }}
        >
          Terima Kasih
        </p>
        <h1 className="font-display text-2xl font-bold mb-3">
          Pesanan Diterima
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
          Pesananmu sedang diproses. Status pembayaran akan diperbarui
          otomatis begitu Midtrans mengonfirmasi transaksinya.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 rounded-md font-semibold text-sm"
          style={{ backgroundColor: "var(--color-gold)", color: "#0b1220" }}
        >
          Kembali ke Beranda
        </Link>
      </div>
    </main>
  );
}
