import type { NextAuthConfig } from "next-auth";

// Config ini SENGAJA tidak berisi provider/adapter Prisma —
// dipakai khusus di middleware.ts (Edge runtime) supaya bundle-nya
// tetap kecil. Provider & adapter lengkap ada di auth.ts.
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as typeof session.user & { id: string; role: string }).id =
          token.id as string;
        (session.user as typeof session.user & { id: string; role: string }).role =
          token.role as string;
      }
      return session;
    },
  },
};
