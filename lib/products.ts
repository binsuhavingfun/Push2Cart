import { mockProducts } from "@/lib/mock-data";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

type ReviewAggregateRow = {
  product_id: string;
  rating: number;
};

export async function getProducts(): Promise<Product[]> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return mockProducts;
  }

  const [{ data, error }, { data: reviews }] = await Promise.all([
    supabase.from("products").select("*").order("name"),
    supabase.from("reviews").select("product_id, rating")
  ]);

  if (error || !data?.length) {
    return mockProducts;
  }

  const grouped = new Map<string, { total: number; count: number }>();

  ((reviews as ReviewAggregateRow[] | null) ?? []).forEach((entry) => {
    const current = grouped.get(entry.product_id) ?? { total: 0, count: 0 };
    current.total += Number(entry.rating);
    current.count += 1;
    grouped.set(entry.product_id, current);
  });

  return (data as Product[]).map((product) => {
    const aggregate = grouped.get(product.id);
    return {
      ...product,
      average_rating: aggregate ? Number((aggregate.total / aggregate.count).toFixed(1)) : 0,
      review_count: aggregate?.count ?? 0
    };
  });
}
