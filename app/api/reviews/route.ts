import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin";
import { enforceRateLimit } from "@/lib/rate-limit";
import {
  getReviewEligibilityForProduct,
  getReviewEligibilityHttpStatus
} from "@/lib/review-eligibility";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Review } from "@/lib/types";
import { normalizeLongText } from "@/lib/validation";

type ReviewPayload = {
  productId: string;
  rating: number;
  comment: string;
};

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Please log in to review products." }, { status: 401 });
  }

  if (await isAdminUser(supabase, user.id)) {
    return NextResponse.json(
      { error: "Admin accounts cannot submit customer product reviews." },
      { status: 403 }
    );
  }

  const rateLimitResponse = await enforceRateLimit({
    request,
    scope: "reviews:create",
    limit: 10,
    windowSeconds: 3600,
    userId: user.id,
    message: "Too many review submissions. Please try again later."
  });

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const payload = (await request.json()) as ReviewPayload;
  const numericRating = Number(payload.rating);
  const safeRating = Number.isFinite(numericRating)
    ? Math.max(1, Math.min(5, Math.trunc(numericRating)))
    : 0;
  const safeComment = normalizeLongText(payload.comment, 500);
  const safeProductId = typeof payload.productId === "string" ? payload.productId.trim() : "";

  if (!safeProductId || !safeProductId.startsWith("prod-") || !safeComment || !safeRating) {
    return NextResponse.json({ error: "Rating and comment are required." }, { status: 400 });
  }

  const eligibility = await getReviewEligibilityForProduct(supabase, safeProductId);

  if (!eligibility.canSubmit) {
    return NextResponse.json(
      { error: eligibility.message },
      { status: getReviewEligibilityHttpStatus(eligibility.reasonCode) }
    );
  }

  const username = user.email?.split("@")[0] ?? "User";

  const { data: review, error } = await supabase
    .from("reviews")
    .insert({
      user_id: user.id,
      product_id: safeProductId,
      rating: safeRating,
      comment: safeComment,
      username
    })
    .select("id, user_id, product_id, rating, comment, created_at, username")
    .single();

  if (error || !review) {
    if (error?.code === "23505") {
      return NextResponse.json(
        { error: "You have already reviewed this product." },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: error?.message ?? "Unable to post review." }, { status: 500 });
  }

  const { data: ratings } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", safeProductId);

  const average =
    ratings && ratings.length
      ? ratings.reduce((sum, item) => sum + Number(item.rating), 0) / ratings.length
      : safeRating;

  return NextResponse.json({ review: review as Review, average: Number(average.toFixed(1)) });
}

