import { CheckoutForm } from "@/components/checkout-form";
import { SectionHeading } from "@/components/section-heading";
import { requireCustomerUser } from "@/lib/admin";

export default async function CheckoutPage() {
  await requireCustomerUser("/checkout");

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Checkout"
        title="Complete Your Arcade Order"
        description="Enter shipping details."
      />
      <CheckoutForm />
    </div>
  );
}
