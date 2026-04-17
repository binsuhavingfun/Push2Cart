"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/format";
import { useCart } from "@/hooks/use-cart";

type VoucherOption = {
  id: string;
  code: string;
  discount_percent: number;
};

export function CheckoutForm() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [vouchers, setVouchers] = useState<VoucherOption[]>([]);
  const [selectedVoucherId, setSelectedVoucherId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fullName,
        address,
        phone,
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
        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="pixel-heading text-[10px] text-white">Full Name</span>
            <input
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="w-full border border-white/10 bg-background/60 px-4 py-3 outline-none focus:border-secondary"
            />
          </label>
          <label className="block space-y-2">
            <span className="pixel-heading text-[10px] text-white">Address</span>
            <textarea
              required
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className="min-h-32 w-full border border-white/10 bg-background/60 px-4 py-3 outline-none focus:border-secondary"
            />
          </label>
          <label className="block space-y-2">
            <span className="pixel-heading text-[10px] text-white">Phone</span>
            <input
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full border border-white/10 bg-background/60 px-4 py-3 outline-none focus:border-secondary"
            />
          </label>
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
