import { CheckoutForm } from "@/components/checkout-form";
import { SectionHeading } from "@/components/section-heading";
import { requireCustomerUser } from "@/lib/admin";
import type { ShippingAddressInput } from "@/lib/shipping";

export default async function CheckoutPage() {
  const { supabase, user } = await requireCustomerUser("/checkout");
  const { data: latestOrder } = await supabase
    .from("orders")
    .select("full_name, phone_number, street_address, barangay, city, province, postal_code, delivery_notes")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const initialShipping: ShippingAddressInput | null = latestOrder
    ? {
        fullName: latestOrder.full_name ?? "",
        phoneNumber: latestOrder.phone_number ?? "",
        streetAddress: latestOrder.street_address ?? "",
        barangay: latestOrder.barangay ?? "",
        city: latestOrder.city ?? "",
        province: latestOrder.province ?? "",
        postalCode: latestOrder.postal_code ?? "",
        deliveryNotes: latestOrder.delivery_notes ?? ""
      }
    : null;

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Checkout"
        title="Complete Your Arcade Order"
        description="Cash on Delivery keeps checkout simple. Enter shipping details and we will store the order securely in Supabase."
      />
      <CheckoutForm initialShipping={initialShipping} />
    </div>
  );
}
