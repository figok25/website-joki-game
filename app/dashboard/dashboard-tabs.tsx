"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/dashboard", label: "Pesanan" },
  { href: "/dashboard/pricing", label: "Kelola Harga" },
];

export function DashboardTabs() {
  const pathname = usePathname();

  return (
    <nav
      className="flex gap-1 mb-8 border-b"
      style={{ borderColor: "var(--color-border)" }}
    >
      {tabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className="px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition"
            style={{
              borderColor: active ? "var(--color-gold)" : "transparent",
              color: active ? "var(--color-text)" : "var(--color-text-muted)",
            }}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
