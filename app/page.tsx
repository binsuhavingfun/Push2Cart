import { HeroSection } from "@/components/hero-section";
import { ProductGrid } from "@/components/product-grid";
import { SectionHeading } from "@/components/section-heading";
import { getProducts } from "@/lib/products";

export default async function HomePage() {
  const products = await getProducts();

  return (
    <div className="space-y-16">
      <HeroSection />
      <section className="space-y-6">
        <SectionHeading
          eyebrow="Featured Loot"
          title="Shop The Retro Drop"
          description="Curated gear with a playful checkout flow, guest-friendly carting, and neon pixel touches that keep the storefront lively without overwhelming the experience."
        />
        <ProductGrid products={products.slice(0, 4)} />
      </section>
    </div>
  );
}
