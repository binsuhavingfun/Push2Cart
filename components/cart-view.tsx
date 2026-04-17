"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";

export function CartView() {
  const { items, subtotal, updateQuantity, removeItem, syncing } = useCart();
  const { user } = useAuth();

  if (!items.length) {
    return (
      <div className="pixel-border pixel-panel p-8 text-center">
        <p className="pixel-heading text-sm text-white">Your cart is empty.</p>
        <p className="mt-3 text-white/70">Browse the arcade shelves and queue up a few wins.</p>
        <Link href="/products" className="pixel-border mt-6 inline-flex px-4 py-3 text-xs">
          Shop Products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.product_id}
            className="pixel-border pixel-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="pixel-heading text-xs text-white">{item.product.name}</p>
              <p className="mt-2 text-sm text-white/70">{formatCurrency(item.product.price)}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                className="pixel-border px-3 py-2 text-xs"
              >
                -
              </button>
              <span className="min-w-8 text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                className="pixel-border px-3 py-2 text-xs"
              >
                +
              </button>
              <button
                onClick={() => removeItem(item.product_id)}
                className="px-3 py-2 text-xs uppercase tracking-[0.24em] text-primary"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <aside className="pixel-border pixel-border-yellow pixel-panel h-fit p-5">
        <p className="pixel-heading text-xs text-white">Cart Summary</p>
        <div className="mt-6 space-y-3 text-sm text-white/80">
          <div className="flex items-center justify-between">
            <span>Mode</span>
            <span>{user ? "Synced with account" : "Guest cart"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
        </div>
        <Link
          href="/checkout"
          className="pixel-border mt-6 inline-flex w-full justify-center px-4 py-3 text-xs"
        >
          {user ? "Proceed to Checkout" : "Login to Checkout"}
        </Link>
        {syncing ? <p className="mt-3 text-xs text-secondary">Syncing cart...</p> : null}
      </aside>
    </div>
  );
}
