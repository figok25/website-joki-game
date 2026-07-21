"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm px-4 py-2 rounded-md border transition"
      style={{ borderColor: "var(--color-border)" }}
    >
      Keluar
    </button>
  );
}
