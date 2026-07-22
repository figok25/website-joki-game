import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Pakai authConfig ringan (tanpa Prisma) khusus untuk middleware,
// supaya ukuran Edge Function tetap di bawah limit Vercel.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/dashboard/:path*", "/order/:path*", "/pesanan/:path*"],
};
