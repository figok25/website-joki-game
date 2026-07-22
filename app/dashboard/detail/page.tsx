import { prisma } from "@/lib/prisma";

export default async function OrderDetailsPage() {
  const orders = await prisma.order.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <p className="text-sm mb-2" style={{ color: "var(--color-text-muted)" }}>
        Detail akun & kontak customer — dipakai untuk verifikasi login/OTP saat proses joki berjalan.
      </p>

      {orders.map((o) => {
        const waNumber = o.customerWhatsapp
          ? o.customerWhatsapp.replace(/[^0-9]/g, "").replace(/^0/, "62")
          : null;

        return (
          <div
            key={o.id}
            className="rounded-xl border p-5"
            style={{
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-surface)",
            }}
          >
            <div className="flex items-start justify-between flex-wrap gap-2 mb-4">
              <p className="font-mono-order text-sm" style={{ color: "var(--color-text-muted)" }}>
                {o.orderNumber}
              </p>
              {waNumber ? (
                <a
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 rounded-md font-semibold"
                  style={{ backgroundColor: "var(--color-teal)", color: "#0b1220" }}
                >
                  Chat WhatsApp
                </a>
              ) : (
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  No WA tidak tersedia
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p style={{ color: "var(--color-text-muted)" }}>Nama Customer</p>
                <p className="mt-0.5">{o.user.name}</p>
              </div>
              <div>
                <p style={{ color: "var(--color-text-muted)" }}>Username Akun Moonton</p>
                <p className="mt-0.5">{o.gameAccountUsername}</p>
              </div>
              <div>
                <p style={{ color: "var(--color-text-muted)" }}>Server ID</p>
                <p className="mt-0.5">{o.gameAccountServerId || "-"}</p>
              </div>
              <div>
                <p style={{ color: "var(--color-text-muted)" }}>No WhatsApp</p>
                <p className="mt-0.5">{o.customerWhatsapp || "-"}</p>
              </div>
              <div className="sm:col-span-2">
                <p style={{ color: "var(--color-text-muted)" }}>Catatan</p>
                <p className="mt-0.5">{o.notes || "-"}</p>
              </div>
            </div>
          </div>
        );
      })}

      {orders.length === 0 && (
        <p className="text-center py-8 text-sm" style={{ color: "var(--color-text-muted)" }}>
          Belum ada pesanan
        </p>
      )}
    </div>
  );
}
