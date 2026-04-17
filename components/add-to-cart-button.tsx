"use client";

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

  return (
    <button onClick={() => addItem(product)} className={className}>
      Add to Cart
    </button>
  );
}
