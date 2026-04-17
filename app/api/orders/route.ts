import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { CartItem } from "@/lib/types";

type OrderPayload = {
  fullName: string;
  address: string;
  phone: string;
  items: CartItem[];
  voucherId?: string | null;
};

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase environment variables are missing." },
      { status: 500 }
    );
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Please log in before checkout." }, { status: 401 });
  }

  const payload = (await request.json()) as OrderPayload;

  if (!payload.items?.length) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  const calculatedSubtotal = payload.items.reduce(
    (sum, item) => sum + Number(item.product.price) * Number(item.quantity),
    0
  );

  let discountPercent = 0;

  if (payload.voucherId) {
    const { data: voucher, error: voucherError } = await supabase
      .from("vouchers")
      .select("id, discount_percent, is_used")
      .eq("id", payload.voucherId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (voucherError) {
      return NextResponse.json({ error: voucherError.message }, { status: 500 });
    }

    if (!voucher || voucher.is_used) {
      return NextResponse.json({ error: "Selected voucher is not available." }, { status: 400 });
    }

    discountPercent = Number(voucher.discount_percent);
  }

  const discountAmount = calculatedSubtotal * (discountPercent / 100);
  const finalTotal = Math.max(calculatedSubtotal - discountAmount, 0);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      status: "Order Placed",
      total_price: finalTotal,
      address: payload.address,
      phone: payload.phone,
      full_name: payload.fullName
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: orderError?.message ?? "Order creation failed." }, { status: 500 });
  }

  const orderItems = payload.items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.product.price
  }));

  const { error: itemError } = await supabase.from("order_items").insert(orderItems);

  if (itemError) {
    return NextResponse.json({ error: itemError.message }, { status: 500 });
  }

  if (payload.voucherId) {
    const { error: voucherUpdateError } = await supabase
      .from("vouchers")
      .update({ is_used: true })
      .eq("id", payload.voucherId)
      .eq("user_id", user.id)
      .eq("is_used", false);

    if (voucherUpdateError) {
      return NextResponse.json({ error: voucherUpdateError.message }, { status: 500 });
    }
  }

  await supabase.from("cart_items").delete().eq("user_id", user.id);

  return NextResponse.json({ orderId: order.id });
}
