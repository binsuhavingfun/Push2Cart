import Link from "next/link";
import { AdminProductForm } from "@/components/admin-product-form";
import { SectionHeading } from "@/components/section-heading";
import { requireAdmin } from "@/lib/admin";

export default async function AdminNewProductPage() {
  await requireAdmin("/admin/products/new");

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Admin"
        title="Add Product"
        description="Create a new product."
      />

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/products" className="pixel-border px-4 py-3 text-xs">
          Back to Products
        </Link>
      </div>

      <AdminProductForm mode="create" />
    </div>
  );
}
