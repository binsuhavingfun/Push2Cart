"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { AddToCartButton } from "@/components/add-to-cart-button";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="pixel-panel pixel-border group overflow-hidden p-4">
      <Link
        href={`/products/${product.id}`}
        className="relative block aspect-[4/3] overflow-hidden border border-white/10 bg-background/50"
      >
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover transition duration-300 group-hover:scale-105"
        />
      </Link>
      <div className="mt-4 space-y-3">
        <div>
          <Link href={`/products/${product.id}`} className="pixel-heading text-sm text-white">
            {product.name}
          </Link>
          <p className="mt-2 text-sm leading-6 text-white/70">{product.description}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-secondary">
            {"★".repeat(Math.round(product.average_rating ?? 0)).padEnd(5, "☆")}{" "}
            {(product.average_rating ?? 0).toFixed(1)} ({product.review_count ?? 0})
          </p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-lg font-semibold text-accent">
            {formatCurrency(product.price)}
          </span>
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  );
}
