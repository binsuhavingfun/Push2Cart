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
        description="Review your picks, update quantities, and head to checkout when you're ready."
      />
      <CartView />
    </div>
  );
}
