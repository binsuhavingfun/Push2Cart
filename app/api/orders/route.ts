import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { CartItem } from "@/lib/types";
import {
  buildAddressLine,
  getDeliveryEstimate,
  normalizeShippingAddress,
  validateShippingAddress
} from "@/lib/shipping";

type OrderPayload = {
  fullName: string;
  phone: string;
  streetAddress: string;
  barangay: string;
  city: string;
  province: string;
  postalCode: string;
  deliveryNotes?: string;
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
  const normalizedAddress = normalizeShippingAddress({
    fullName: payload.fullName,
    phoneNumber: payload.phone,
    streetAddress: payload.streetAddress,
    barangay: payload.barangay,
    city: payload.city,
    province: payload.province,
    postalCode: payload.postalCode,
    deliveryNotes: payload.deliveryNotes ?? ""
  });
  const addressErrors = validateShippingAddress(normalizedAddress);

  if (!payload.items?.length) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  if (Object.keys(addressErrors).length > 0) {
    const firstError = Object.values(addressErrors)[0];
    return NextResponse.json(
      { error: firstError ?? "Please enter a valid shipping address.", validationErrors: addressErrors },
      { status: 400 }
    );
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

  const estimatedDelivery = getDeliveryEstimate(normalizedAddress.province);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      status: "Order Placed",
      total_price: finalTotal,
      address: buildAddressLine(normalizedAddress),
      phone: normalizedAddress.phoneNumber,
      full_name: normalizedAddress.fullName,
      phone_number: normalizedAddress.phoneNumber,
      street_address: normalizedAddress.streetAddress,
      barangay: normalizedAddress.barangay,
      city: normalizedAddress.city,
      province: normalizedAddress.province,
      postal_code: normalizedAddress.postalCode,
      delivery_notes: normalizedAddress.deliveryNotes
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

  return NextResponse.json({
    orderId: order.id,
    estimatedDeliveryDays: estimatedDelivery.days,
    estimatedDeliveryArea: estimatedDelivery.areaLabel
  });
}
