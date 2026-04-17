import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types";

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

  const { error } = await supabase
    .from("orders")
    .update({ status: payload.status })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
