import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminOrderStatusSelect } from "@/components/admin-order-status-select";
import { SectionHeading } from "@/components/section-heading";
import { formatCurrency } from "@/lib/format";
import { requireAdmin } from "@/lib/admin";
import type { Order, OrderStatusEvent, Product } from "@/lib/types";

type OrderItemRow = {
  id: string;
  quantity: number;
  price: number;
  product: Product;
};

export default async function AdminOrderDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin(`/admin/orders/${id}`);

  const { data: order } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();

  if (!order) {
    notFound();
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("id, quantity, price, product:products(*)")
    .eq("order_id", id);
  const { data: events } = await supabase
    .from("order_status_events")
    .select("id, order_id, status, note, created_at, actor_user_id")
    .eq("order_id", id)
    .order("created_at", { ascending: false });

  const typedOrder = order as Order;
  const typedItems = (items as OrderItemRow[] | null) ?? [];
  const typedEvents = (events as OrderStatusEvent[] | null) ?? [];
  const shippingAddress =
    [
      typedOrder.street_address,
      typedOrder.barangay,
      typedOrder.city,
      typedOrder.province,
      typedOrder.postal_code
    ]
      .filter(Boolean)
      .join(", ") || typedOrder.address;

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Admin"
        title={`Order #${typedOrder.id.slice(0, 8)}`}
        description="Inspect customer details, payment snapshot, and purchased items in one place."
      />

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/orders" className="pixel-border px-4 py-3 text-xs">
          Back to Orders
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-6">
          <div className="pixel-border pixel-panel p-6">
            <p className="pixel-heading text-xs text-secondary">Customer</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/55">Name</p>
                <p className="mt-2 text-white">{typedOrder.full_name ?? "Customer"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/55">Email</p>
                <p className="mt-2 text-white">{typedOrder.email ?? "No email captured"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/55">Phone</p>
                <p className="mt-2 text-white">
                  {typedOrder.phone_number ?? typedOrder.phone ?? "No phone provided"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/55">Placed</p>
                <p className="mt-2 text-white">{new Date(typedOrder.created_at).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="pixel-border pixel-panel p-6">
            <p className="pixel-heading text-xs text-secondary">Delivery</p>
            <div className="mt-5 space-y-4 text-white/85">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/55">Address</p>
                <p className="mt-2">{shippingAddress}</p>
              </div>
              {typedOrder.delivery_notes ? (
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/55">Delivery notes</p>
                  <p className="mt-2">{typedOrder.delivery_notes}</p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="pixel-border pixel-panel p-6">
            <p className="pixel-heading text-xs text-secondary">Items</p>
            <div className="mt-5 space-y-4">
              {typedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 text-sm text-white/80 last:border-none last:pb-0"
                >
                  <div>
                    <p className="text-white">{item.product.name}</p>
                    <p className="mt-1 text-white/55">
                      {formatCurrency(item.price)} each x {item.quantity}
                    </p>
                  </div>
                  <p className="text-accent">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
              {!typedItems.length ? (
                <p className="text-sm text-white/60">No items were found for this order.</p>
              ) : null}
            </div>
          </div>

          <div className="pixel-border pixel-panel p-6">
            <p className="pixel-heading text-xs text-secondary">Order Activity</p>
            <div className="mt-5 space-y-4">
              {typedEvents.map((event) => (
                <div key={event.id} className="border-b border-white/10 pb-4 text-sm text-white/80 last:border-none last:pb-0">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-white">{event.status}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-white/50">
                      {new Date(event.created_at).toLocaleString()}
                    </p>
                  </div>
                  {event.note ? <p className="mt-2 text-white/60">{event.note}</p> : null}
                </div>
              ))}
              {!typedEvents.length ? (
                <p className="text-sm text-white/60">No order activity has been logged yet.</p>
              ) : null}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="pixel-border pixel-border-cyan pixel-panel p-6">
            <p className="pixel-heading text-xs text-secondary">Order Summary</p>
            <div className="mt-5 space-y-4 text-sm text-white/80">
              <div className="flex items-center justify-between gap-4">
                <span>Order ID</span>
                <span>{typedOrder.id.slice(0, 8)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Payment method</span>
                <span>{typedOrder.payment_method ?? "Cash on Delivery"}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Payment status</span>
                <span>{typedOrder.payment_status ?? "Pending"}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Total</span>
                <span className="text-accent">{formatCurrency(typedOrder.total_price)}</span>
              </div>
            </div>
          </div>

          <div className="pixel-border pixel-border-yellow pixel-panel p-6">
            <AdminOrderStatusSelect orderId={typedOrder.id} currentStatus={typedOrder.status} />
          </div>
        </aside>
      </div>
    </div>
  );
}
