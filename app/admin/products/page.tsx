import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { formatCurrency } from "@/lib/format";
import { requireAdmin } from "@/lib/admin";
import type { Product } from "@/lib/types";

export default async function AdminProductsPage() {
  const { supabase } = await requireAdmin("/admin/products");
  const { data } = await supabase
    .from("products")
    .select("id, name, description, price, image_url, stock")
    .order("name");

  const products = (data as Product[] | null) ?? [];

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Admin"
        title="Products Management"
        description="Add and update products."
      />

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/products/new" className="pixel-border px-4 py-3 text-xs">
          Add Product
        </Link>
      </div>

      {!products.length ? (
        <div className="pixel-border pixel-panel p-6 text-white/80">No products yet.</div>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => (
            <article
              key={product.id}
              className="pixel-border pixel-panel flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="min-w-0">
                <p className="pixel-heading text-xs text-white">{product.name}</p>
                <p className="mt-2 text-sm text-white/65">{product.id}</p>
                <p className="mt-3 line-clamp-2 text-sm text-white/75">{product.description}</p>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/80 lg:justify-end">
                <p>{formatCurrency(product.price)}</p>
                <p>Stock: {product.stock}</p>
                <Link href={`/admin/products/${product.id}`} className="pixel-border px-4 py-3 text-xs">
                  Edit
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
