import { NextResponse } from "next/server";
import { logSecurityEvent } from "@/lib/security-events";
import { getSupabaseServerClient } from "@/lib/supabase/server";
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

  const { error } = await supabase.rpc(
    "cancel_order_for_customer",
    {
      p_order_id: id
    } as never
  );

  if (error) {
    if (error.message === "You can only manage your own orders.") {
      await logSecurityEvent({
        event_type: "customer_order_access_denied",
        user_id: user.id,
        request,
        details: { order_id: id }
      });
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error.message === "Order not found.") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (
      error.message ===
      "This order can no longer be cancelled because it has already been shipped or completed."
    ) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
