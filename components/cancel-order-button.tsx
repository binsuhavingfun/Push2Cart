"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [message, setMessage] = useState("");

  const handleCancel = async () => {
    if (!isConfirming) {
      setIsConfirming(true);
      setMessage("Click confirm to cancel this order before shipment.");
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
      setIsConfirming(false);
      setIsSubmitting(false);
      return;
    }

    setMessage("Order cancelled.");
    setIsConfirming(false);
    setIsSubmitting(false);
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="mt-5 space-y-3">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="pixel-border px-4 py-3 text-xs text-white disabled:opacity-60"
        >
          {isSubmitting ? "Cancelling..." : isConfirming ? "Confirm Cancel" : "Cancel Order"}
        </button>
        {isConfirming ? (
          <button
            type="button"
            onClick={() => {
              setIsConfirming(false);
              setMessage("");
            }}
            disabled={isSubmitting}
            className="pixel-border px-4 py-3 text-xs text-white/75 disabled:opacity-60"
          >
            Keep Order
          </button>
        ) : null}
      </div>
      {message ? <p className="text-sm text-secondary">{message}</p> : null}
    </div>
  );
}
