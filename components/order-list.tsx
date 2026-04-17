import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import type { Order } from "@/lib/types";

export function OrderList({ orders }: { orders: Order[] }) {
  if (!orders.length) {
    return (
      <div className="pixel-border pixel-panel p-8">
        <p className="pixel-heading text-sm text-white">No orders yet.</p>
        <p className="mt-3 text-white/70">
          Your checkout history will appear here once you place your first arcade haul.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/orders/${order.id}`}
          className="pixel-border pixel-panel flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="pixel-heading text-xs text-white">Order #{order.id.slice(0, 8)}</p>
            <p className="mt-2 text-sm text-white/70">{new Date(order.created_at).toLocaleString()}</p>
          </div>
          <div className="text-sm text-white/80">
            <p>{order.status}</p>
            <p className="mt-1 text-accent">{formatCurrency(order.total_price)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
