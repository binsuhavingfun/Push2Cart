import { SectionHeading } from "@/components/section-heading";
import { requireUser } from "@/lib/auth";
import type { Review } from "@/lib/types";

type MyReview = Review & {
  product?: {
    name: string;
  };
};

function renderStars(rating: number) {
  return "★".repeat(rating).padEnd(5, "☆");
}

export default async function AccountPage() {
  const { supabase, user } = await requireUser("/account");
  const { data } = await supabase
    .from("reviews")
    .select("id, user_id, product_id, rating, comment, created_at, username, product:products(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const reviews = (data as MyReview[] | null) ?? [];

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Account"
        title="My Reviews"
        description="See the ratings and feedback you shared on purchased products."
      />

      {!reviews.length ? (
        <div className="pixel-border pixel-panel p-6 text-white/80">
          No reviews yet. Rate a product from its detail page.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <article key={review.id} className="pixel-border pixel-panel p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="pixel-heading text-[10px] text-white">
                  {review.product?.name ?? "Product"}
                </p>
                <p className="text-sm text-accent">{renderStars(review.rating)}</p>
              </div>
              <p className="mt-3 text-white/80">{review.comment}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-secondary">
                {new Date(review.created_at).toLocaleDateString()}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
