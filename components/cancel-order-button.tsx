"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleCancel = async () => {
    const confirmed = window.confirm(
      "Cancel this order? You can only do this before it has been shipped."
    );

    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    const response = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" })
    });

    const result = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setMessage(result?.error ?? "Unable to cancel this order right now.");
      setIsSubmitting(false);
      return;
    }

    setMessage("Order cancelled.");
    router.refresh();
  };

  return (
    <div className="mt-5 space-y-3">
      <button
        type="button"
        onClick={handleCancel}
        disabled={isSubmitting}
        className="pixel-border px-4 py-3 text-xs text-white disabled:opacity-60"
      >
        {isSubmitting ? "Cancelling..." : "Cancel Order"}
      </button>
      {message ? <p className="text-sm text-secondary">{message}</p> : null}
    </div>
  );
}
