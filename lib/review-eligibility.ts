import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReviewEligibility, ReviewEligibilityReason } from "@/lib/types";

type ReviewEligibilityRpcRow = {
  allowed: boolean;
  reason_code: string | null;
  message: string | null;
  qualifying_order_id: string | null;
};

const defaultEligibility: ReviewEligibility = {
  canSubmit: false,
  reasonCode: "unknown_error",
  message: "Unable to verify review eligibility right now.",
  qualifyingOrderId: null
};

const reviewEligibilityMessages: Record<Exclude<ReviewEligibilityReason, "eligible" | "unknown_error">, string> = {
  login_required: "Please log in to submit a review.",
  admin_account: "Admin accounts cannot submit customer product reviews.",
  duplicate_review: "You have already reviewed this product.",
  not_purchased: "You can only review products that you have purchased.",
  not_delivered: "Reviews are available after your order has been delivered.",
  product_not_found: "This product could not be found."
};

const reviewEligibilityStatusCodes: Record<ReviewEligibilityReason, number> = {
  eligible: 200,
  login_required: 401,
  admin_account: 403,
  duplicate_review: 409,
  not_purchased: 403,
  not_delivered: 403,
  product_not_found: 404,
  unknown_error: 500
};

export function normalizeReviewEligibility(row?: ReviewEligibilityRpcRow | null): ReviewEligibility {
  if (!row) {
    return defaultEligibility;
  }

  const reasonCode = (row.reason_code as ReviewEligibilityReason | null) ?? "unknown_error";

  return {
    canSubmit: Boolean(row.allowed),
    reasonCode,
    message:
      row.message?.trim() ||
      (reasonCode === "eligible"
        ? ""
        : reviewEligibilityMessages[reasonCode as Exclude<ReviewEligibilityReason, "eligible" | "unknown_error">] ??
          defaultEligibility.message),
    qualifyingOrderId: row.qualifying_order_id ?? null
  };
}

export async function getReviewEligibilityForProduct(
  supabase: SupabaseClient,
  productId: string
): Promise<ReviewEligibility> {
  const { data, error } = await supabase.rpc("review_eligibility_for_product", {
    p_product_id: productId
  } as never);

  if (error) {
    return {
      ...defaultEligibility,
      message: error.message || defaultEligibility.message
    };
  }

  const row = Array.isArray(data) ? (data[0] as ReviewEligibilityRpcRow | undefined) : (data as ReviewEligibilityRpcRow | null | undefined);

  return normalizeReviewEligibility(row);
}

export function getReviewEligibilityHttpStatus(reasonCode: ReviewEligibilityReason) {
  return reviewEligibilityStatusCodes[reasonCode] ?? 500;
}
