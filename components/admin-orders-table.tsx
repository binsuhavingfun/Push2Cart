"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/lib/types";

type AdminOrder = {
  id: string;
  full_name: string | null;
  email?: string | null;
  address: string;
  street_address?: string | null;
  barangay?: string | null;
  city?: string | null;
  province?: string | null;
  postal_code?: string | null;
  total_price: number;
  payment_method?: PaymentMethod | null;
  payment_status?: PaymentStatus | null;
  status: OrderStatus;
  created_at: string;
};

const statuses: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled"
];

export function AdminOrdersTable({ initialOrders }: { initialOrders: AdminOrder[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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

  const formatAddress = (order: AdminOrder) => {
    const structured = [
      order.street_address,
      order.barangay,
      order.city,
      order.province,
      order.postal_code
    ]
      .filter(Boolean)
      .join(", ");

    return structured || order.address;
  };

  const filteredOrders = orders.filter((order) => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const statusMatches = statusFilter === "all" || order.status === statusFilter;
    const dateMatches =
      !dateFilter || new Date(order.created_at).toISOString().slice(0, 10) === dateFilter;
    const searchMatches =
      !normalizedSearch ||
      order.id.toLowerCase().includes(normalizedSearch) ||
      (order.full_name ?? "").toLowerCase().includes(normalizedSearch) ||
      formatAddress(order).toLowerCase().includes(normalizedSearch);
    return statusMatches && dateMatches && searchMatches;
  });

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (order) => !["Delivered", "Cancelled"].includes(order.status)
  ).length;
  const completedOrders = orders.filter((order) => order.status === "Delivered").length;

  return (
    <div className="pixel-border pixel-panel p-6">
      {message ? <p className="mb-4 text-sm text-secondary">{message}</p> : null}
      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <div className="border border-white/10 bg-background/40 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-secondary">Total orders</p>
          <p className="mt-2 text-2xl text-white">{totalOrders}</p>
        </div>
        <div className="border border-white/10 bg-background/40 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-secondary">Pending orders</p>
          <p className="mt-2 text-2xl text-white">{pendingOrders}</p>
        </div>
        <div className="border border-white/10 bg-background/40 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-secondary">Completed orders</p>
          <p className="mt-2 text-2xl text-white">{completedOrders}</p>
        </div>
      </div>
      <div className="mb-5 grid gap-3 lg:grid-cols-3">
        <label className="space-y-2 lg:col-span-1">
          <span className="text-xs uppercase tracking-[0.2em] text-secondary">Search</span>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Order ID, customer, or address"
            className="w-full border border-white/10 bg-background/60 px-3 py-2"
          />
        </label>
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
      <p className="mb-4 text-xs uppercase tracking-[0.18em] text-white/55">
        Showing {filteredOrders.length} of {orders.length} orders
      </p>
      <div className="overflow-auto">
        <table className="w-full min-w-[760px] text-sm text-white/80">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.2em] text-secondary">
              <th className="pb-3">Order</th>
              <th className="pb-3">Customer</th>
              <th className="pb-3">Email</th>
              <th className="pb-3">Address</th>
              <th className="pb-3">Total</th>
              <th className="pb-3">Payment</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className="border-t border-white/10">
                <td className="py-3">
                  <Link href={`/admin/orders/${order.id}`} className="text-secondary hover:text-white">
                    {order.id.slice(0, 8)}
                  </Link>
                </td>
                <td className="py-3">{order.full_name ?? "Customer"}</td>
                <td className="py-3">{order.email ?? "No email"}</td>
                <td className="py-3">{formatAddress(order)}</td>
                <td className="py-3">PHP {Number(order.total_price).toFixed(2)}</td>
                <td className="py-3">
                  <p>{order.payment_method ?? "Cash on Delivery"}</p>
                  <p className="text-xs text-white/55">{order.payment_status ?? "Pending"}</p>
                </td>
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
                <td colSpan={7} className="py-5 text-center text-white/60">
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
