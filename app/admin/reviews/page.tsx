import { AdminReviewDeleteButton } from "@/components/admin-review-delete-button";
import { SectionHeading } from "@/components/section-heading";
import { requireAdmin } from "@/lib/admin";

type AdminReviewRow = {
  id: string;
  rating: number;
  comment: string;
  username: string;
  created_at: string;
  product: { name: string } | null;
};

export default async function AdminReviewsPage() {
  const { supabase } = await requireAdmin("/admin/reviews");
  const { data } = await supabase
    .from("reviews")
    .select("id, rating, comment, username, created_at, product:products(name)")
    .order("created_at", { ascending: false });

  const reviews = (data as AdminReviewRow[] | null) ?? [];

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Admin"
        title="Review Moderation"
        description="Review and manage feedback."
      />

      {!reviews.length ? (
        <div className="pixel-border pixel-panel p-6 text-white/80">No reviews yet.</div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <article key={review.id} className="pixel-border pixel-panel p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div>
                    <p className="pixel-heading text-[10px] text-white">
                      {review.product?.name ?? "Product Review"}
                    </p>
                    <p className="mt-2 text-sm text-white/65">
                      {review.username} · {new Date(review.created_at).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-sm text-accent">{"★".repeat(review.rating).padEnd(5, "☆")}</p>
                  <p className="text-sm leading-6 text-white/80">{review.comment}</p>
                </div>
                <AdminReviewDeleteButton reviewId={review.id} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
