import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminProductForm } from "@/components/admin-product-form";
import { SectionHeading } from "@/components/section-heading";
import { requireAdmin } from "@/lib/admin";
import type { Product } from "@/lib/types";

export default async function AdminProductDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin(`/admin/products/${id}`);

  const { data: product } = await supabase
    .from("products")
    .select("id, name, description, price, image_url, stock")
    .eq("id", id)
    .maybeSingle();

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Admin"
        title="Edit Product"
        description="Update product details."
      />

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/products" className="pixel-border px-4 py-3 text-xs">
          Back to Products
        </Link>
      </div>

      <AdminProductForm mode="edit" initialProduct={product as Product} />
    </div>
  );
}
