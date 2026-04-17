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
          description="A selection of gear you can easily check out and add to your setup. Everything stays simple and fun to explore without being over naman sa ask."
        />
        <ProductGrid products={products.slice(0, 4)} />
      </section>
    </div>
  );
}
