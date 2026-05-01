import { notFound } from "next/navigation";
import { OrderStatusTimeline } from "@/components/order-status-timeline";
import { requireCustomerUser } from "@/lib/admin";
import { formatCurrency } from "@/lib/format";
import type { Order, Product } from "@/lib/types";
import { getDeliveryEstimate } from "@/lib/shipping";

type OrderItemRow = {
  id: string;
  quantity: number;
  price: number;
  product: Product;
};

export default async function OrderDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user } = await requireCustomerUser(`/orders/${id}`);

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!order) {
    notFound();
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("id, quantity, price, product:products(*)")
    .eq("order_id", id);

  const typedOrder = order as Order;
  const fullAddress = [
    typedOrder.street_address,
    typedOrder.barangay,
    typedOrder.city,
    typedOrder.province,
    typedOrder.postal_code
  ]
    .filter(Boolean)
    .join(", ");
  const shippingAddress = fullAddress || typedOrder.address;
  const derivedProvince =
    typedOrder.province ??
    (typedOrder.address.toLowerCase().includes("metro manila") ? "Metro Manila" : "");
  const region = getDeliveryEstimate(derivedProvince).regionType === "metro" ? "Metro" : "Provincial";

  return (
    <div className="space-y-8">
      <div className="pixel-border pixel-panel p-6">
        <p className="pixel-heading text-xs text-secondary">Order #{typedOrder.id.slice(0, 8)}</p>
        <h1 className="pixel-heading mt-4 text-xl text-white">Shipment Status</h1>
        <p className="mt-3 text-white/75">
          Shipping to {typedOrder.full_name} at {shippingAddress}
        </p>
        {typedOrder.phone_number || typedOrder.phone ? (
          <p className="mt-2 text-sm text-white/65">Contact: {typedOrder.phone_number ?? typedOrder.phone}</p>
        ) : null}
        {typedOrder.delivery_notes ? (
          <p className="mt-2 text-sm text-white/65">Delivery notes: {typedOrder.delivery_notes}</p>
        ) : null}
      </div>
      <OrderStatusTimeline status={typedOrder.status} region={region} />
      <div className="pixel-border pixel-panel p-6">
        <p className="pixel-heading text-xs text-white">Items</p>
        <div className="mt-6 space-y-4">
          {((items as OrderItemRow[] | null) ?? []).map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 text-sm text-white/80">
              <span>
                {item.product.name} x{item.quantity}
              </span>
              <span>{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
