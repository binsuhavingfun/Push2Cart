import { NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { CartItem } from "@/lib/types";
import { normalizeLongText, normalizeShortText, isUuid } from "@/lib/validation";
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

  const rateLimitResponse = await enforceRateLimit({
    request,
    scope: "orders:create",
    limit: 5,
    windowSeconds: 600,
    userId: user.id,
    message: "Too many checkout attempts. Please wait a few minutes before trying again."
  });

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const payload = (await request.json()) as OrderPayload;
  const normalizedAddress = normalizeShippingAddress({
    fullName: normalizeShortText(payload.fullName, 120),
    phoneNumber: normalizeShortText(payload.phone, 32),
    streetAddress: normalizeLongText(payload.streetAddress, 180),
    barangay: normalizeShortText(payload.barangay, 120),
    city: normalizeShortText(payload.city, 120),
    province: normalizeShortText(payload.province, 120),
    postalCode: normalizeShortText(payload.postalCode, 20),
    deliveryNotes: normalizeLongText(payload.deliveryNotes ?? "", 240)
  });
  const addressErrors = validateShippingAddress(normalizedAddress);

  if (!payload.items?.length) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  const normalizedItems = Array.from(
    payload.items.reduce((accumulator, item) => {
      const productId = item.product_id?.trim();
      const quantity = Math.trunc(Number(item.quantity));

      if (!productId || !Number.isFinite(quantity) || quantity <= 0) {
        return accumulator;
      }

      accumulator.set(productId, (accumulator.get(productId) ?? 0) + quantity);
      return accumulator;
    }, new Map<string, number>())
  ).map(([product_id, quantity]) => ({ product_id, quantity }));

  if (!normalizedItems.length) {
    return NextResponse.json({ error: "Your cart contains invalid item data." }, { status: 400 });
  }

  if (payload.voucherId && !isUuid(payload.voucherId)) {
    return NextResponse.json({ error: "Invalid voucher reference." }, { status: 400 });
  }

  if (Object.keys(addressErrors).length > 0) {
    const firstError = Object.values(addressErrors)[0];
    return NextResponse.json(
      { error: firstError ?? "Please enter a valid shipping address.", validationErrors: addressErrors },
      { status: 400 }
    );
  }

  const estimatedDelivery = getDeliveryEstimate(normalizedAddress.province);
  const { data, error } = await supabase.rpc("create_order_with_items", {
    p_user_id: user.id,
    p_email: user.email ?? null,
    p_full_name: normalizedAddress.fullName,
    p_phone_number: normalizedAddress.phoneNumber,
    p_street_address: normalizedAddress.streetAddress,
    p_barangay: normalizedAddress.barangay,
    p_city: normalizedAddress.city,
    p_province: normalizedAddress.province,
    p_postal_code: normalizedAddress.postalCode,
    p_delivery_notes: normalizedAddress.deliveryNotes,
    p_address: buildAddressLine(normalizedAddress),
    p_payment_method: "Cash on Delivery",
    p_voucher_id: payload.voucherId ?? null,
    p_items: normalizedItems
  });

  const order = Array.isArray(data) ? data[0] : data;

  if (error || !order?.order_id) {
    return NextResponse.json({ error: error?.message ?? "Order creation failed." }, { status: 400 });
  }

  return NextResponse.json({
    orderId: order.order_id,
    estimatedDeliveryDays: estimatedDelivery.days,
    estimatedDeliveryArea: estimatedDelivery.areaLabel
  });
}
