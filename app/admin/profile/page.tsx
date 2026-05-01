import Link from "next/link";
import { ProfileLogoutButton } from "@/components/profile-logout-button";
import { SectionHeading } from "@/components/section-heading";
import { requireAdmin } from "@/lib/admin";

export default async function AdminProfilePage() {
  const { supabase, user } = await requireAdmin("/admin/profile");

  const [{ count: totalOrders }, { count: activeOrders }, { count: reportCount }] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }).in("status", ["Pending", "Confirmed", "Preparing", "Shipped", "Out for Delivery"]),
    supabase.from("reports").select("*", { count: "exact", head: true })
  ]);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Admin"
        title="Admin Profile"
        description="Admin tools and account access."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Admin Email", value: user.email ?? "No email found" },
          { label: "Tracked Orders", value: String(totalOrders ?? 0) },
          { label: "Open Work", value: `${activeOrders ?? 0} active / ${reportCount ?? 0} reports` }
        ].map((item) => (
          <div key={item.label} className="pixel-border pixel-panel p-5">
            <p className="pixel-heading text-[10px] text-white">{item.label}</p>
            <p className="mt-3 text-sm text-white/75">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <div className="pixel-border pixel-panel p-6">
          <p className="pixel-heading text-xs text-white">Admin Shortcuts</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Link href="/admin" className="border border-white/10 bg-background/40 px-4 py-4 text-sm text-white/80 transition-colors hover:border-secondary/40 hover:text-white">
              Dashboard
            </Link>
            <Link href="/admin/orders" className="border border-white/10 bg-background/40 px-4 py-4 text-sm text-white/80 transition-colors hover:border-secondary/40 hover:text-white">
              Orders
            </Link>
            <Link href="/admin/reports" className="border border-white/10 bg-background/40 px-4 py-4 text-sm text-white/80 transition-colors hover:border-secondary/40 hover:text-white">
              Reports
            </Link>
          </div>
        </div>

        <div className="pixel-border pixel-panel p-6">
          <p className="pixel-heading text-xs text-white">Session Controls</p>
          <p className="mt-4 text-sm leading-6 text-white/75">Sign out of this admin session.</p>
          <ProfileLogoutButton className="pixel-border mt-6 w-full px-4 py-3 text-xs" />
        </div>
      </div>
    </div>
  );
}
