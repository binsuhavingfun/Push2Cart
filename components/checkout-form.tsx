"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/format";
import { useCart } from "@/hooks/use-cart";
import {
  buildAddressLine,
  getDeliveryEstimate,
  type ShippingAddressInput,
  validateShippingAddress
} from "@/lib/shipping";

type VoucherOption = {
  id: string;
  code: string;
  discount_percent: number;
};

export function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [shipping, setShipping] = useState<ShippingAddressInput>({
    fullName: "",
    phoneNumber: "",
    streetAddress: "",
    barangay: "",
    city: "",
    province: "",
    postalCode: "",
    deliveryNotes: ""
  });
  const [vouchers, setVouchers] = useState<VoucherOption[]>([]);
  const [selectedVoucherId, setSelectedVoucherId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ShippingAddressInput, string>>>(
    {}
  );

  useEffect(() => {
    fetch("/api/vouchers")
      .then((response) => response.json())
      .then((payload: { vouchers: VoucherOption[] }) => {
        setVouchers(payload.vouchers ?? []);
      })
      .catch(() => setVouchers([]));
  }, []);

  const selectedVoucher = vouchers.find((voucher) => voucher.id === selectedVoucherId);
  const discountAmount = selectedVoucher
    ? (subtotal * selectedVoucher.discount_percent) / 100
    : 0;
  const totalAfterDiscount = Math.max(subtotal - discountAmount, 0);
  const deliveryEstimate = shipping.province.trim()
    ? getDeliveryEstimate(shipping.province)
    : null;

  const updateField = (field: keyof ShippingAddressInput, value: string) => {
    setShipping((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }
      return { ...current, [field]: "" };
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateShippingAddress(shipping);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setMessage("Please complete the required shipping fields.");
      return;
    }

    setSubmitting(true);
    setMessage("");
    const normalizedAddress = buildAddressLine(shipping);

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fullName: shipping.fullName,
        phone: shipping.phoneNumber,
        address: normalizedAddress,
        streetAddress: shipping.streetAddress,
        barangay: shipping.barangay,
        city: shipping.city,
        province: shipping.province,
        postalCode: shipping.postalCode,
        deliveryNotes: shipping.deliveryNotes,
        items,
        voucherId: selectedVoucherId || null
      })
    });

    const payload = (await response.json()) as { error?: string; orderId?: string };

    if (!response.ok || !payload.orderId) {
      setMessage(payload.error ?? "Unable to place order.");
      setSubmitting(false);
      return;
    }

    await clearCart();
    router.push(`/orders/${payload.orderId}`);
    router.refresh();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <form onSubmit={handleSubmit} className="pixel-border pixel-panel p-6">
        <div className="space-y-6">
          <section className="space-y-4">
            <h3 className="pixel-heading text-xs text-accent">Shipping Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-2">
                <span className="pixel-heading text-[10px] text-white">Full Name</span>
                <input
                  required
                  value={shipping.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                  className="w-full border border-white/10 bg-background/60 px-4 py-3 outline-none focus:border-secondary"
                />
                {fieldErrors.fullName ? (
                  <p className="text-xs text-primary">{fieldErrors.fullName}</p>
                ) : null}
              </label>
              <label className="block space-y-2">
                <span className="pixel-heading text-[10px] text-white">Phone Number</span>
                <input
                  required
                  value={shipping.phoneNumber}
                  onChange={(event) => updateField("phoneNumber", event.target.value)}
                  placeholder="09XXXXXXXXX or +639XXXXXXXXX"
                  className="w-full border border-white/10 bg-background/60 px-4 py-3 outline-none focus:border-secondary"
                />
                {fieldErrors.phoneNumber ? (
                  <p className="text-xs text-primary">{fieldErrors.phoneNumber}</p>
                ) : null}
              </label>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="pixel-heading text-xs text-accent">Delivery Address</h3>
            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="pixel-heading text-[10px] text-white">Street Address</span>
                <input
                  required
                  value={shipping.streetAddress}
                  onChange={(event) => updateField("streetAddress", event.target.value)}
                  className="w-full border border-white/10 bg-background/60 px-4 py-3 outline-none focus:border-secondary"
                />
                {fieldErrors.streetAddress ? (
                  <p className="text-xs text-primary">{fieldErrors.streetAddress}</p>
                ) : null}
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="pixel-heading text-[10px] text-white">Barangay</span>
                  <input
                    required
                    value={shipping.barangay}
                    onChange={(event) => updateField("barangay", event.target.value)}
                    className="w-full border border-white/10 bg-background/60 px-4 py-3 outline-none focus:border-secondary"
                  />
                  {fieldErrors.barangay ? (
                    <p className="text-xs text-primary">{fieldErrors.barangay}</p>
                  ) : null}
                </label>
                <label className="block space-y-2">
                  <span className="pixel-heading text-[10px] text-white">City / Municipality</span>
                  <input
                    required
                    value={shipping.city}
                    onChange={(event) => updateField("city", event.target.value)}
                    className="w-full border border-white/10 bg-background/60 px-4 py-3 outline-none focus:border-secondary"
                  />
                  {fieldErrors.city ? <p className="text-xs text-primary">{fieldErrors.city}</p> : null}
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="pixel-heading text-[10px] text-white">Province</span>
                  <input
                    required
                    value={shipping.province}
                    onChange={(event) => updateField("province", event.target.value)}
                    className="w-full border border-white/10 bg-background/60 px-4 py-3 outline-none focus:border-secondary"
                  />
                  {fieldErrors.province ? (
                    <p className="text-xs text-primary">{fieldErrors.province}</p>
                  ) : null}
                </label>
                <label className="block space-y-2">
                  <span className="pixel-heading text-[10px] text-white">Postal Code</span>
                  <input
                    required
                    value={shipping.postalCode}
                    onChange={(event) => updateField("postalCode", event.target.value)}
                    className="w-full border border-white/10 bg-background/60 px-4 py-3 outline-none focus:border-secondary"
                  />
                  {fieldErrors.postalCode ? (
                    <p className="text-xs text-primary">{fieldErrors.postalCode}</p>
                  ) : null}
                </label>
              </div>
            </div>
            {deliveryEstimate ? (
              <div className="border border-secondary/40 bg-secondary/10 px-4 py-3 text-sm text-white/85">
                Estimated delivery: {deliveryEstimate.label} ({deliveryEstimate.areaLabel})
              </div>
            ) : null}
          </section>

          <section className="space-y-3">
            <h3 className="pixel-heading text-xs text-accent">Delivery Notes</h3>
            <label className="block space-y-2">
              <span className="pixel-heading text-[10px] text-white">Optional Notes</span>
              <textarea
                value={shipping.deliveryNotes}
                onChange={(event) => updateField("deliveryNotes", event.target.value)}
                placeholder="House color, nearest landmark, gate instructions, etc."
                className="min-h-24 w-full border border-white/10 bg-background/60 px-4 py-3 outline-none focus:border-secondary"
              />
            </label>
          </section>

          <div className="border border-accent/30 bg-accent/10 px-4 py-4 text-sm text-white/80">
            Payment method: Cash on Delivery (COD)
          </div>
          <label className="block space-y-2">
            <span className="pixel-heading text-[10px] text-white">Voucher</span>
            <select
              value={selectedVoucherId}
              onChange={(event) => setSelectedVoucherId(event.target.value)}
              className="w-full border border-white/10 bg-background/60 px-4 py-3 outline-none focus:border-secondary"
            >
              <option value="">No voucher</option>
              {vouchers.map((voucher) => (
                <option key={voucher.id} value={voucher.id}>
                  {voucher.code} ({voucher.discount_percent}% off)
                </option>
              ))}
            </select>
          </label>
          <button type="submit" disabled={submitting} className="pixel-border w-full px-4 py-3 text-xs">
            {submitting ? "Placing Order..." : "Place Order"}
          </button>
          {message ? <p className="text-sm text-primary">{message}</p> : null}
        </div>
      </form>
      <aside className="pixel-border pixel-border-cyan pixel-panel p-6">
        <p className="pixel-heading text-xs text-white">Order Summary</p>
        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <div
              key={item.product_id}
              className="flex items-center justify-between gap-4 text-sm text-white/80"
            >
              <span>
                {item.product.name} x{item.quantity}
              </span>
              <span>{formatCurrency(item.product.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 border-t border-white/10 pt-4 text-lg font-semibold text-accent">
          Discount: {formatCurrency(discountAmount)}
        </div>
        <div className="mt-3 text-lg font-semibold text-accent">
          Total: {formatCurrency(totalAfterDiscount)}
        </div>
      </aside>
    </div>
  );
}
