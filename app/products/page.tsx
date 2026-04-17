import { ProductGrid } from "@/components/product-grid";
import { SectionHeading } from "@/components/section-heading";
import { getProducts } from "@/lib/products";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Storefront"
        title="Arcade Shelf"
        description="Browse the full Push2Cart catalog with pixel-framed product cards and quick add-to-cart actions."
      />
      <ProductGrid products={products} />
    </div>
  );
}
