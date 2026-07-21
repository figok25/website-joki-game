export { auth as middleware } from "@/auth";

// Halaman apa saja yang wajib login. Pengecekan role (admin/user)
// dilakukan di masing-masing page/layout, bukan di sini, supaya
// middleware tetap ringan (jalan di Edge runtime, tidak akses Prisma).
export const config = {
  matcher: ["/dashboard/:path*"],
};
