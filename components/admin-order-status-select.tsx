"use client";

import { useState } from "react";
import type { OrderStatus } from "@/lib/types";

const statuses: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled"
];

export function AdminOrderStatusSelect({
  orderId,
  currentStatus
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = async (nextStatus: OrderStatus) => {
    setStatus(nextStatus);
    setSaving(true);
    setMessage("");

    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus })
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setStatus(currentStatus);
      setMessage(payload.error ?? "Unable to update order status.");
      setSaving(false);
      return;
    }

    setMessage("Order status updated.");
    setSaving(false);
  };

  return (
    <div className="space-y-3">
      <label className="space-y-2">
        <span className="text-xs uppercase tracking-[0.2em] text-secondary">Order status</span>
        <select
          value={status}
          onChange={(event) => handleChange(event.target.value as OrderStatus)}
          disabled={saving}
          className="w-full border border-white/10 bg-background/60 px-3 py-2"
        >
          {statuses.map((entry) => (
            <option key={entry} value={entry}>
              {entry}
            </option>
          ))}
        </select>
      </label>
      {message ? <p className="text-sm text-secondary">{message}</p> : null}
    </div>
  );
}
