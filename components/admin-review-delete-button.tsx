"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminReviewDeleteButton({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleDelete = async () => {
    const confirmed = window.confirm("Remove this review?");

    if (!confirmed) {
      return;
    }

    setSubmitting(true);
    setMessage("");

    const response = await fetch(`/api/admin/reviews/${reviewId}`, {
      method: "DELETE"
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setMessage(payload?.error ?? "Unable to remove review.");
      setSubmitting(false);
      return;
    }

    router.refresh();
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={submitting}
        className="pixel-border px-4 py-3 text-xs text-white disabled:opacity-60"
      >
        {submitting ? "Removing..." : "Remove Review"}
      </button>
      {message ? <p className="text-sm text-secondary">{message}</p> : null}
    </div>
  );
}
