import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileLogoutButton } from "@/components/profile-logout-button";
import { SectionHeading } from "@/components/section-heading";
import { isAdminUser } from "@/lib/admin";
import { formatCurrency } from "@/lib/format";
import { requireUser } from "@/lib/auth";
import type { Order, Voucher } from "@/lib/types";

export default async function AccountPage() {
  const { supabase, user } = await requireUser("/account");

  if (await isAdminUser(supabase, user.id)) {
    redirect("/admin/profile");
  }

  const [{ data: orderData }, { data: voucherData }] = await Promise.all([
    supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("vouchers")
      .select("id, user_id, code, discount_percent, is_used")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
  ]);

  const orders = (orderData as Order[] | null) ?? [];
  const vouchers = (voucherData as Voucher[] | null) ?? [];
  const latestOrder = orders[0];
  const deliveredOrders = orders.filter((order) => order.status === "Delivered");
  const activeVouchers = vouchers.filter((voucher) => !voucher.is_used);
  const usedVouchers = vouchers.filter((voucher) => voucher.is_used);

  const fullName = latestOrder?.full_name ?? user.email?.split("@")[0] ?? "Push2Cart Customer";
  const phone = latestOrder?.phone_number ?? latestOrder?.phone ?? "No contact number saved yet";
  const address = latestOrder
    ? [
        latestOrder.street_address,
        latestOrder.barangay,
        latestOrder.city,
        latestOrder.province,
        latestOrder.postal_code
      ]
        .filter(Boolean)
        .join(", ") || latestOrder.address
    : "No shipping address saved yet";

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Profile"
        title="Customer Account"
        description="Your account, orders, and vouchers in one place."
      />

      <div className="grid gap-6 lg:grid-cols-[0.32fr_0.68fr] lg:items-start">
        <aside className="pixel-border pixel-panel p-5 lg:sticky lg:top-32">
          <p className="pixel-heading text-xs text-white">Profile Menu</p>
          <nav className="mt-5 flex flex-col gap-2 text-sm text-white/75">
            <a href="#my-account" className="border border-white/10 px-4 py-3 transition-colors hover:text-white">
              My Account
            </a>
            <a href="#my-orders" className="border border-white/10 px-4 py-3 transition-colors hover:text-white">
              My Orders
            </a>
            <a href="#purchase-history" className="border border-white/10 px-4 py-3 transition-colors hover:text-white">
              Purchase History
            </a>
            <a href="#vouchers" className="border border-white/10 px-4 py-3 transition-colors hover:text-white">
              Vouchers
            </a>
            <a href="#settings" className="border border-white/10 px-4 py-3 transition-colors hover:text-white">
              Settings
            </a>
          </nav>
          <ProfileLogoutButton className="pixel-border mt-5 w-full px-4 py-3 text-xs" />
        </aside>

        <div className="space-y-6">
          <section id="my-account" className="pixel-border pixel-panel p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="pixel-heading text-xs text-white">My Account</p>
                <h2 className="mt-3 text-xl font-semibold text-accent">{fullName}</h2>
                <p className="mt-2 text-sm text-white/70">Account overview</p>
              </div>
              <div className="grid gap-3 text-sm text-white/75 sm:grid-cols-2 md:min-w-[18rem]">
                <div className="border border-white/10 bg-background/40 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-secondary">Orders</p>
                  <p className="mt-2 text-lg font-semibold text-white">{orders.length}</p>
                </div>
                <div className="border border-white/10 bg-background/40 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-secondary">Active Vouchers</p>
                  <p className="mt-2 text-lg font-semibold text-white">{activeVouchers.length}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="border border-white/10 bg-background/40 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-secondary">Email</p>
                <p className="mt-2 text-sm text-white/80">{user.email ?? "No email saved"}</p>
              </div>
              <div className="border border-white/10 bg-background/40 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-secondary">Contact Number</p>
                <p className="mt-2 text-sm text-white/80">{phone}</p>
              </div>
              <div className="border border-white/10 bg-background/40 p-4 md:col-span-2">
                <p className="text-xs uppercase tracking-[0.2em] text-secondary">Saved Delivery Address</p>
                <p className="mt-2 text-sm leading-6 text-white/80">{address}</p>
              </div>
            </div>
          </section>

          <section id="my-orders" className="pixel-border pixel-panel p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="pixel-heading text-xs text-white">My Orders</p>
              <Link href="/orders" className="text-xs uppercase tracking-[0.2em] text-secondary hover:text-white">
                Open full tracking
              </Link>
            </div>
            <div className="mt-5 space-y-4">
              {!orders.length ? (
                <p className="text-sm text-white/70">No orders yet.</p>
              ) : (
                orders.slice(0, 5).map((order) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="flex flex-col gap-3 border border-white/10 bg-background/40 px-4 py-4 text-sm text-white/80 transition-colors hover:border-secondary/40 hover:text-white sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="pixel-heading text-[10px] text-white">Order #{order.id.slice(0, 8)}</p>
                      <p className="mt-2 text-white/65">{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p>{order.status}</p>
                      <p className="mt-2 text-accent">{formatCurrency(order.total_price)}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          <section id="purchase-history" className="pixel-border pixel-panel p-6">
            <p className="pixel-heading text-xs text-white">Purchase History</p>
            <div className="mt-5 space-y-4">
              {!deliveredOrders.length ? (
                <p className="text-sm text-white/70">
                  No completed purchases yet.
                </p>
              ) : (
                deliveredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col gap-3 border border-white/10 bg-background/40 px-4 py-4 text-sm text-white/80 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="pixel-heading text-[10px] text-white">Purchase #{order.id.slice(0, 8)}</p>
                      <p className="mt-2 text-white/65">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p>{order.status}</p>
                      <p className="mt-2 text-accent">{formatCurrency(order.total_price)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section id="vouchers" className="pixel-border pixel-panel p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="pixel-heading text-xs text-white">Vouchers</p>
              <p className="text-xs uppercase tracking-[0.2em] text-secondary">
                {activeVouchers.length} active / {usedVouchers.length} used
              </p>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.2em] text-secondary">Available</p>
                {!activeVouchers.length ? (
                  <p className="text-sm text-white/70">No active vouchers.</p>
                ) : (
                  activeVouchers.map((voucher) => (
                    <div key={voucher.id} className="border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm text-white/80">
                      <p className="pixel-heading text-[10px] text-white">{voucher.code}</p>
                      <p className="mt-2">{voucher.discount_percent}% off your next order</p>
                    </div>
                  ))
                )}
              </div>
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.2em] text-secondary">Used</p>
                {!usedVouchers.length ? (
                  <p className="text-sm text-white/70">No used vouchers yet.</p>
                ) : (
                  usedVouchers.slice(0, 4).map((voucher) => (
                    <div key={voucher.id} className="border border-white/10 bg-background/40 px-4 py-3 text-sm text-white/65">
                      <p className="pixel-heading text-[10px] text-white">{voucher.code}</p>
                      <p className="mt-2">{voucher.discount_percent}% off redeemed</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <section id="settings" className="pixel-border pixel-panel p-6">
            <p className="pixel-heading text-xs text-white">Settings</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="border border-white/10 bg-background/40 p-4 text-sm text-white/75">
                <p className="text-xs uppercase tracking-[0.2em] text-secondary">Account Details</p>
                <p className="mt-2">Your signed-in email is used for login and order updates.</p>
              </div>
              <div className="border border-white/10 bg-background/40 p-4 text-sm text-white/75">
                <p className="text-xs uppercase tracking-[0.2em] text-secondary">Need Help?</p>
                <p className="mt-2">
                  Use the <Link href="/report" className="text-secondary hover:text-white">report form</Link> for feedback or issues.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
