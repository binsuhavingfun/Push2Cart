"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition
} from "react";
import { mockProducts } from "@/lib/mock-data";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CartItem, Product } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (product: Product) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  syncing: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "push2cart_guest_cart";

type GuestCartStorageItem = {
  product_id: string;
  quantity: number;
  product?: Product;
};

function mapGuestItems(rawItems: GuestCartStorageItem[]) {
  return rawItems
    .map((item) => {
      const product =
        item.product ?? mockProducts.find((entry) => entry.id === item.product_id);

      if (!product) {
        return null;
      }

      return {
        id: `guest-${item.product_id}`,
        product_id: item.product_id,
        quantity: item.quantity,
        product
      } satisfies CartItem;
    })
    .filter(Boolean) as CartItem[];
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [syncing, startTransition] = useTransition();

  useEffect(() => {
    if (!user) {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as GuestCartStorageItem[]) : [];
      setItems(mapGuestItems(parsed));
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    startTransition(async () => {
      const rawGuestCart = window.localStorage.getItem(STORAGE_KEY);
      const guestItems = rawGuestCart
        ? (JSON.parse(rawGuestCart) as GuestCartStorageItem[])
        : [];

      if (guestItems.length) {
        await supabase.from("cart_items").upsert(
          guestItems.map((item) => ({
            user_id: user.id,
            product_id: item.product_id,
            quantity: item.quantity
          })),
          {
            onConflict: "user_id,product_id"
          }
        );
        window.localStorage.removeItem(STORAGE_KEY);
      }

      const { data } = await supabase
        .from("cart_items")
        .select("id, product_id, quantity, product:products(*)")
        .eq("user_id", user.id);

      if (data) {
        setItems(data as CartItem[]);
      }
    });
  }, [user]);

  const persistGuestCart = (nextItems: CartItem[]) => {
    window.localStorage.setItem(
      STORAGE_KEY,
        JSON.stringify(
          nextItems.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            product: item.product
          }))
        )
      );
  };

  const addItem = async (product: Product) => {
    const existing = items.find((item) => item.product_id === product.id);
    const nextItems = existing
      ? items.map((item) =>
          item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      : [...items, { id: `local-${product.id}`, product_id: product.id, quantity: 1, product }];

    setItems(nextItems);
    showToast(`${product.name} added to cart.`);

    if (!user) {
      persistGuestCart(nextItems);
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    await supabase.from("cart_items").upsert(
      {
        user_id: user.id,
        product_id: product.id,
        quantity: (existing?.quantity ?? 0) + 1
      },
      {
        onConflict: "user_id,product_id"
      }
    );
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(productId);
      return;
    }

    const nextItems = items.map((item) =>
      item.product_id === productId ? { ...item, quantity } : item
    );

    setItems(nextItems);

    if (!user) {
      persistGuestCart(nextItems);
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("user_id", user.id)
      .eq("product_id", productId);
  };

  const removeItem = async (productId: string) => {
    const nextItems = items.filter((item) => item.product_id !== productId);
    setItems(nextItems);

    if (!user) {
      persistGuestCart(nextItems);
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);
  };

  const clearCart = async () => {
    setItems([]);
    window.localStorage.removeItem(STORAGE_KEY);

    if (!user) {
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    await supabase.from("cart_items").delete().eq("user_id", user.id);
  };

  const value = useMemo(
    () => ({
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      syncing
    }),
    [items, syncing]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
