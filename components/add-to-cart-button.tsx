"use client";

import { useAdminStatus } from "@/hooks/use-admin-status";
import type { Product } from "@/lib/types";
import { useCart } from "@/hooks/use-cart";

export function AddToCartButton({
  product,
  className = "pixel-border px-3 py-3 text-xs pixel-button"
}: {
  product: Product;
  className?: string;
}) {
  const { addItem } = useCart();
  const { isAdmin, loading } = useAdminStatus();

  if (isAdmin) {
    return null;
  }

  return (
    <button onClick={() => addItem(product)} className={className} disabled={loading}>
      Add to Cart
    </button>
  );
}
