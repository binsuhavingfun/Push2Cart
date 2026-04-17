import { AdminOrdersTable } from "@/components/admin-orders-table";
import { SectionHeading } from "@/components/section-heading";
import { requireAdmin } from "@/lib/admin";

type AdminOrderRow = {
  id: string;
  full_name: string | null;
  address: string;
  street_address?: string | null;
  barangay?: string | null;
  city?: string | null;
  province?: string | null;
  postal_code?: string | null;
  total_price: number;
  status: "Order Placed" | "Packed" | "Shipped" | "Out for Delivery" | "Delivered";
  created_at: string;
};

export default async function AdminOrdersPage() {
  const { supabase } = await requireAdmin("/admin/orders");
  const { data } = await supabase
    .from("orders")
    .select("id, full_name, address, street_address, barangay, city, province, postal_code, total_price, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Admin"
        title="Order Operations"
        description="View all customer orders and update status in real time."
      />
      <AdminOrdersTable initialOrders={(data as AdminOrderRow[] | null) ?? []} />
    </div>
  );
}
