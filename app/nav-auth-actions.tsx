"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export function NavAuthActions({
  userName,
}: {
  userName: string | null | undefined;
}) {
  if (userName) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Halo, {userName}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sm px-4 py-2 rounded-md border transition"
          style={{ borderColor: "var(--color-border)" }}
        >
          Keluar
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="text-sm px-4 py-2 rounded-md border transition"
        style={{ borderColor: "var(--color-border)" }}
      >
        Masuk
      </Link>
      <Link
        href="/register"
        className="text-sm px-4 py-2 rounded-md font-semibold transition"
        style={{ backgroundColor: "var(--color-gold)", color: "#0b1220" }}
      >
        Daftar
      </Link>
    </div>
  );
}
