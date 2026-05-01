import { redirect } from "next/navigation";
import { CartView } from "@/components/cart-view";
import { SectionHeading } from "@/components/section-heading";
import { getServerAdminState } from "@/lib/admin";

export default async function CartPage() {
  if (await getServerAdminState()) {
    redirect("/admin");
  }

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Cart"
        title="Build Your Loadout"
        description="Guest carts stay local, signed-in carts sync with Supabase, and every add-to-cart gets a quick toast ping."
      />
      <CartView />
    </div>
  );
}
