"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { OrderStatus } from "@/lib/types";

type AdminOrder = {
  id: string;
  full_name: string | null;
  address: string;
  total_price: number;
  status: OrderStatus;
  created_at: string;
};

const statuses: OrderStatus[] = [
  "Order Placed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered"
];

export function AdminOrdersTable({ initialOrders }: { initialOrders: AdminOrder[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    const channel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
        const updated = payload.new as AdminOrder;
        if (!updated?.id) {
          return;
        }

        setOrders((current) =>
          current
            .map((order) => (order.id === updated.id ? { ...order, ...updated } : order))
            .sort((a, b) => Number(new Date(b.created_at)) - Number(new Date(a.created_at)))
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    setMessage("");
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setMessage(payload.error ?? "Unable to update order status.");
      return;
    }

    setOrders((current) =>
      current.map((order) => (order.id === orderId ? { ...order, status } : order))
    );
    setMessage("Order status updated.");
  };

  const filteredOrders = orders.filter((order) => {
    const statusMatches = statusFilter === "all" || order.status === statusFilter;
    const dateMatches =
      !dateFilter || new Date(order.created_at).toISOString().slice(0, 10) === dateFilter;
    return statusMatches && dateMatches;
  });

  return (
    <div className="pixel-border pixel-panel p-6">
      {message ? <p className="mb-4 text-sm text-secondary">{message}</p> : null}
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.2em] text-secondary">Status</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "all" | OrderStatus)}
            className="w-full border border-white/10 bg-background/60 px-3 py-2"
          >
            <option value="all">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-xs uppercase tracking-[0.2em] text-secondary">Order date</span>
          <input
            type="date"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            className="w-full border border-white/10 bg-background/60 px-3 py-2"
          />
        </label>
      </div>
      <div className="overflow-auto">
        <table className="w-full min-w-[760px] text-sm text-white/80">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.2em] text-secondary">
              <th className="pb-3">Order</th>
              <th className="pb-3">Customer</th>
              <th className="pb-3">Address</th>
              <th className="pb-3">Total</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className="border-t border-white/10">
                <td className="py-3">{order.id.slice(0, 8)}</td>
                <td className="py-3">{order.full_name ?? "Customer"}</td>
                <td className="py-3">{order.address}</td>
                <td className="py-3">PHP {Number(order.total_price).toFixed(2)}</td>
                <td className="py-3">
                  <select
                    value={order.status}
                    onChange={(event) =>
                      handleStatusChange(order.id, event.target.value as OrderStatus)
                    }
                    className="border border-white/10 bg-background/60 px-3 py-2"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {!filteredOrders.length ? (
              <tr>
                <td colSpan={5} className="py-5 text-center text-white/60">
                  No orders match this filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
