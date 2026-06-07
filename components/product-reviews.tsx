"use client";

import { useState } from "react";
import type { Review } from "@/lib/types";

type ProductReviewsProps = {
  productId: string;
  initialReviews: Review[];
  initialAverage: number;
};

function renderStars(rating: number) {
  return "★".repeat(rating).padEnd(5, "☆");
}

export function ProductReviews({
  productId,
  initialReviews,
  initialAverage
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [average, setAverage] = useState(initialAverage);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmitting(true);
    setMessage("");

    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, rating, comment })
    });

    const payload = (await response.json()) as {
      error?: string;
      review?: Review;
      average?: number;
    };

    if (!response.ok || !payload.review) {
      setMessage(payload.error ?? "Unable to submit review.");
      if (response.status === 401 || response.status === 403) {
        setBlocked(true);
      }
      setSubmitting(false);
      return;
    }

    setReviews((current) => [payload.review!, ...current]);
    setAverage(payload.average ?? average);
    setComment("");
    setRating(5);
    setMessage("Review posted.");
    setBlocked(true);
    setSubmitting(false);
  };

  return (
    <section className="space-y-6">
      <div className="pixel-border pixel-panel p-6">
        <p className="pixel-heading text-xs text-white">Reviews</p>
        <p className="mt-3 text-sm text-white/75">
          Average rating: {average.toFixed(1)} / 5 from {reviews.length} review(s)
        </p>
      </div>

      {blocked ? (
        <div className="pixel-border pixel-panel p-6">
          <p className="pixel-heading text-xs text-white">Review Locked</p>
          <p className="mt-3 text-sm text-white/70">
            {message || "You need to purchase this product to review it."}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="pixel-border pixel-panel space-y-4 p-6">
          <p className="pixel-heading text-xs text-white">Write A Review</p>
          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-[0.2em] text-secondary">Rating</span>
            <select
              value={rating}
              onChange={(event) => setRating(Number(event.target.value))}
              className="w-full border border-white/15 bg-background/60 px-3 py-2"
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} - {renderStars(value)}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-[0.2em] text-secondary">Comment</span>
            <textarea
              required
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              className="min-h-24 w-full border border-white/15 bg-background/60 px-3 py-2"
              placeholder="Share your experience with this product."
            />
          </label>
          <button disabled={submitting} className="pixel-border px-4 py-3 text-xs">
            {submitting ? "Posting..." : "Post Review"}
          </button>
          {message ? <p className="text-sm text-secondary">{message}</p> : null}
        </form>
      )}

      <div className="space-y-4">
        {reviews.map((review) => (
          <article key={review.id} className="pixel-border pixel-panel p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="pixel-heading text-[10px] text-white">{review.username ?? "User"}</p>
              <p className="text-sm text-accent">{renderStars(review.rating)}</p>
            </div>
            <p className="mt-3 text-white/80">{review.comment}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
