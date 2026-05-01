import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types";
import { isUuid } from "@/lib/validation";

const allowedStatuses: OrderStatus[] = [
  "Order Placed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered"
];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();

  if (!isUuid(id)) {
    return NextResponse.json({ error: "Invalid order ID." }, { status: 400 });
  }

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Please log in." }, { status: 401 });
  }

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminUser) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const payload = (await request.json()) as { status?: OrderStatus };

  if (!payload.status || !allowedStatuses.includes(payload.status)) {
    return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
  }

  const { data: existingOrder } = await supabase
    .from("orders")
    .select("status")
    .eq("id", id)
    .maybeSingle();

  if (!existingOrder) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: payload.status })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (existingOrder.status !== payload.status) {
    await supabase.from("order_status_events").insert({
      order_id: id,
      status: payload.status,
      actor_user_id: user.id,
      note: "Updated from admin dashboard"
    });
  }

  return NextResponse.json({ success: true });
}
