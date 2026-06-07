import Image from "next/image";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductCard } from "@/components/product-card";
import { ProductReviews } from "@/components/product-reviews";
import { SectionHeading } from "@/components/section-heading";
import { isAdminUser } from "@/lib/admin";
import { formatCurrency } from "@/lib/format";
import { getReviewEligibilityForProduct } from "@/lib/review-eligibility";
import { getProducts } from "@/lib/products";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Review, ReviewEligibility } from "@/lib/types";

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const products = await getProducts();
  const product = products.find((item) => item.id === id);

  if (!product) {
    notFound();
  }

  const relatedProducts = products.filter((item) => item.id !== id).slice(0, 3);
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  const isAdmin = supabase && user ? await isAdminUser(supabase, user.id) : false;
  const { data: rawReviews } = supabase
    ? await supabase
        .from("reviews")
        .select("id, user_id, product_id, rating, comment, created_at, username")
        .eq("product_id", id)
        .order("created_at", { ascending: false })
    : { data: [] as Review[] };
  const reviewEligibility: ReviewEligibility =
    supabase && user && !isAdmin
      ? await getReviewEligibilityForProduct(supabase, id)
      : {
          canSubmit: false,
          reasonCode: user ? "admin_account" : "login_required",
          message: user
            ? "Admin accounts cannot submit customer product reviews."
            : "Please log in to submit a review.",
          qualifyingOrderId: null
        };

  const reviews = (rawReviews as Review[] | null) ?? [];
  const average = reviews.length
    ? reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length
    : 0;

  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
        <div className="pixel-border pixel-panel relative min-h-[320px] overflow-hidden p-4">
          <div className="relative h-full min-h-[288px] overflow-hidden border border-white/10">
            <Image src={product.image_url} alt={product.name} fill className="object-cover" />
          </div>
        </div>
        <div className="pixel-border pixel-border-cyan pixel-panel p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">
            Product Page
          </p>
          <h1 className="pixel-heading mt-4 text-xl text-white">{product.name}</h1>
          <p className="mt-4 text-white/75">{product.description}</p>
          <p className="mt-6 text-2xl font-semibold text-accent">
            {formatCurrency(product.price)}
          </p>
          <div className="mt-6 inline-flex border border-white/10 bg-background/50 px-4 py-3 text-sm text-white/75">
            Stock available: {product.stock}
          </div>
          {isAdmin ? (
            <div className="pixel-border pixel-panel mt-6 p-4 text-sm text-white/75">
              Admin view only. Shopping actions and customer reviews are disabled for admin accounts.
            </div>
          ) : (
            <AddToCartButton
              product={product}
              className="pixel-border mt-6 px-5 py-4 text-xs pixel-button"
            />
          )}
        </div>
      </section>
      <section className="space-y-6">
        <SectionHeading
          eyebrow="More Loot"
          title="Keep Browsing"
          description="A few more picks from the Push2Cart shelf."
        />
        <div className="grid gap-5 md:grid-cols-3">
          {relatedProducts.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
      <ProductReviews
        productId={id}
        initialReviews={reviews}
        initialAverage={average}
        reviewEligibility={reviewEligibility}
      />
    </div>
  );
}
