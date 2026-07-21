import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardTabs } from "./dashboard-tabs";
import { LogoutButton } from "./logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if ((session.user as { role?: string }).role !== "ADMIN") redirect("/");

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Dashboard Admin</h1>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Halo, {session.user.name}
            </p>
          </div>
          <LogoutButton />
        </div>
        <DashboardTabs />
        {children}
      </div>
    </main>
  );
}
