import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Review } from "@/lib/types";

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

  const payload = (await request.json()) as ReviewPayload;
  const safeRating = Math.max(1, Math.min(5, Number(payload.rating)));
  const safeComment = payload.comment?.trim();

  if (!payload.productId || !safeComment) {
    return NextResponse.json({ error: "Rating and comment are required." }, { status: 400 });
  }

  const username = user.email?.split("@")[0] ?? "User";

  const { data: review, error } = await supabase
    .from("reviews")
    .insert({
      user_id: user.id,
      product_id: payload.productId,
      rating: safeRating,
      comment: safeComment,
      username
    })
    .select("id, user_id, product_id, rating, comment, created_at, username")
    .single();

  if (error || !review) {
    return NextResponse.json({ error: error?.message ?? "Unable to post review." }, { status: 500 });
  }

  const { data: ratings } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", payload.productId);

  const average =
    ratings && ratings.length
      ? ratings.reduce((sum, item) => sum + Number(item.rating), 0) / ratings.length
      : safeRating;

  return NextResponse.json({ review: review as Review, average: Number(average.toFixed(1)) });
}
