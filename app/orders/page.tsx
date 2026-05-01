import { OrderList } from "@/components/order-list";
import { SectionHeading } from "@/components/section-heading";
import { requireCustomerUser } from "@/lib/admin";
import type { Order } from "@/lib/types";

export default async function OrdersPage() {
  const { supabase, user } = await requireCustomerUser("/orders");
  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Orders"
        title="Track Your Deliveries"
        description="Review your Push2Cart order history and jump into detailed tracking for each purchase."
      />
      <OrderList orders={(data as Order[] | null) ?? []} />
    </div>
  );
}
