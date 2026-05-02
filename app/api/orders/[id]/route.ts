import { NextResponse } from "next/server";
import { logSecurityEvent } from "@/lib/security-events";
import { canCustomerCancelOrder } from "@/lib/order-status";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types";
import { isUuid } from "@/lib/validation";

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

  const payload = (await request.json()) as { action?: string };

  if (payload.action !== "cancel") {
    return NextResponse.json({ error: "Invalid order action." }, { status: 400 });
  }

  const { data: order } = await supabase
    .from("orders")
    .select("id, user_id, status")
    .eq("id", id)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (order.user_id !== user.id) {
    await logSecurityEvent({
      event_type: "customer_order_access_denied",
      user_id: user.id,
      request,
      details: { order_id: id }
    });
    return NextResponse.json({ error: "You can only manage your own orders." }, { status: 403 });
  }

  const currentStatus = order.status as OrderStatus;

  if (!canCustomerCancelOrder(currentStatus)) {
    return NextResponse.json(
      { error: "This order can no longer be cancelled because it has already been shipped or completed." },
      { status: 409 }
    );
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: "Cancelled" })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("order_status_events").insert({
    order_id: id,
    status: "Cancelled",
    actor_user_id: user.id,
    note: "Cancelled by customer"
  });

  return NextResponse.json({ success: true });
}
