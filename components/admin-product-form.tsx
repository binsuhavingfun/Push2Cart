"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buildProductId } from "@/lib/admin-products";
import type { Product } from "@/lib/types";

type AdminProductFormProps = {
  mode: "create" | "edit";
  initialProduct?: Product;
};

export function AdminProductForm({ mode, initialProduct }: AdminProductFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialProduct?.name ?? "");
  const [description, setDescription] = useState(initialProduct?.description ?? "");
  const [imageUrl, setImageUrl] = useState(initialProduct?.image_url ?? "");
  const [price, setPrice] = useState(String(initialProduct?.price ?? ""));
  const [stock, setStock] = useState(String(initialProduct?.stock ?? ""));
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const previewId = initialProduct?.id ?? buildProductId(name);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    const endpoint =
      mode === "create" ? "/api/admin/products" : `/api/admin/products/${initialProduct!.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: previewId,
        name,
        description,
        image_url: imageUrl,
        price,
        stock
      })
    });

    const payload = (await response.json().catch(() => null)) as
      | { error?: string; id?: string }
      | null;

    if (!response.ok) {
      setMessage(payload?.error ?? "Unable to save product.");
      setSubmitting(false);
      return;
    }

    router.push(mode === "create" ? `/admin/products/${payload?.id ?? previewId}` : "/admin/products");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="pixel-border pixel-panel space-y-5 p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block space-y-2 sm:col-span-2">
          <span className="pixel-heading text-[10px] text-white">Product Name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full border border-white/15 bg-background/60 px-4 py-3 outline-none focus:border-secondary"
            required
          />
        </label>

        <label className="block space-y-2 sm:col-span-2">
          <span className="pixel-heading text-[10px] text-white">Product ID</span>
          <input
            value={previewId}
            readOnly
            className="w-full border border-white/10 bg-background/40 px-4 py-3 text-white/55 outline-none"
          />
        </label>

        <label className="block space-y-2 sm:col-span-2">
          <span className="pixel-heading text-[10px] text-white">Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-28 w-full border border-white/15 bg-background/60 px-4 py-3 outline-none focus:border-secondary"
            required
          />
        </label>

        <label className="block space-y-2 sm:col-span-2">
          <span className="pixel-heading text-[10px] text-white">Image Path</span>
          <input
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            className="w-full border border-white/15 bg-background/60 px-4 py-3 outline-none focus:border-secondary"
            placeholder="/images/product.svg"
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="pixel-heading text-[10px] text-white">Price</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className="w-full border border-white/15 bg-background/60 px-4 py-3 outline-none focus:border-secondary"
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="pixel-heading text-[10px] text-white">Stock</span>
          <input
            type="number"
            min="0"
            step="1"
            value={stock}
            onChange={(event) => setStock(event.target.value)}
            className="w-full border border-white/15 bg-background/60 px-4 py-3 outline-none focus:border-secondary"
            required
          />
        </label>
      </div>

      <button type="submit" disabled={submitting} className="pixel-border px-4 py-3 text-xs disabled:opacity-60">
        {submitting ? "Saving..." : mode === "create" ? "Add Product" : "Save Changes"}
      </button>

      {message ? <p className="text-sm text-secondary">{message}</p> : null}
    </form>
  );
}
