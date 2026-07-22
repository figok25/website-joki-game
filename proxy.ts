import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Pakai authConfig ringan (tanpa Prisma) supaya proxy tetap ringan.
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ["/dashboard/:path*", "/order/:path*", "/pesanan/:path*"],
};
