import { CheckoutForm } from "@/components/checkout-form";
import { SectionHeading } from "@/components/section-heading";
import { requireUser } from "@/lib/auth";

export default async function CheckoutPage() {
  await requireUser("/checkout");

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Checkout"
        title="Complete Your Arcade Order"
        description="Cash on Delivery keeps checkout simple. Enter shipping details and we will store the order securely in Supabase."
      />
      <CheckoutForm />
    </div>
  );
}
