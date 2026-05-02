import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { requireAdmin } from "@/lib/admin";

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin("/admin");

  const [
    { count: totalOrders },
    { count: activeOrders },
    { count: reportCount },
    { count: productCount },
    { count: reviewCount },
    { data: recentOrders }
  ] =
    await Promise.all([
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }).in("status", ["Pending", "Confirmed", "Preparing", "Shipped", "Out for Delivery"]),
      supabase.from("reports").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("reviews").select("*", { count: "exact", head: true }),
      supabase
        .from("orders")
        .select("id, full_name, status, created_at")
        .order("created_at", { ascending: false })
        .limit(4)
    ]);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Admin"
        title="Management Dashboard"
        description="Orders, reports, and store activity."
      />

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        {[
          { label: "Total Orders", value: String(totalOrders ?? 0) },
          { label: "Active Fulfillment", value: String(activeOrders ?? 0) },
          { label: "Reports Inbox", value: String(reportCount ?? 0) },
          { label: "Products", value: String(productCount ?? 0) },
          { label: "Reviews", value: String(reviewCount ?? 0) }
        ].map((item) => (
          <div key={item.label} className="pixel-border pixel-panel p-5">
            <p className="pixel-heading text-[10px] text-white">{item.label}</p>
            <p className="mt-4 text-2xl font-semibold text-accent">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="pixel-border pixel-panel p-6">
          <p className="pixel-heading text-xs text-white">Recent Orders</p>
          <div className="mt-5 space-y-4">
            {((recentOrders as { id: string; full_name: string | null; status: string; created_at: string }[] | null) ?? []).map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between gap-4 border border-white/10 bg-background/40 px-4 py-3 text-sm text-white/80 transition-colors hover:border-secondary/40 hover:text-white"
              >
                <div>
                  <p className="pixel-heading text-[10px] text-white">
                    Order #{order.id.slice(0, 8)}
                  </p>
                  <p className="mt-2 text-white/65">{order.full_name ?? "Customer order"}</p>
                </div>
                <div className="text-right">
                  <p>{order.status}</p>
                  <p className="mt-2 text-xs text-secondary">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Link href="/admin/orders" className="pixel-border pixel-panel block p-5 transition-colors hover:text-accent">
            <p className="pixel-heading text-xs text-white">Orders Management</p>
            <p className="mt-3 text-sm text-white/70">View and update orders.</p>
          </Link>
          <Link href="/admin/products" className="pixel-border pixel-panel block p-5 transition-colors hover:text-accent">
            <p className="pixel-heading text-xs text-white">Products Management</p>
            <p className="mt-3 text-sm text-white/70">Add and update products.</p>
          </Link>
          <Link href="/admin/reports" className="pixel-border pixel-panel block p-5 transition-colors hover:text-accent">
            <p className="pixel-heading text-xs text-white">Reports Management</p>
            <p className="mt-3 text-sm text-white/70">Review user reports and feedback.</p>
          </Link>
          <Link href="/admin/reviews" className="pixel-border pixel-panel block p-5 transition-colors hover:text-accent">
            <p className="pixel-heading text-xs text-white">Review Moderation</p>
            <p className="mt-3 text-sm text-white/70">Review and manage feedback.</p>
          </Link>
          <Link href="/admin/profile" className="pixel-border pixel-panel block p-5 transition-colors hover:text-accent">
            <p className="pixel-heading text-xs text-white">Admin Profile</p>
            <p className="mt-3 text-sm text-white/70">Account access and shortcuts.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
