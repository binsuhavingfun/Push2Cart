"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/game", label: "Mini Game" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { itemCount } = useCart();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase || !user) {
      setIsAdmin(false);
      return;
    }

    const checkAdmin = async () => {
      try {
        const { data } = await supabase
          .from("admin_users")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();
        setIsAdmin(Boolean(data));
      } catch {
        setIsAdmin(false);
      }
    };

    void checkAdmin();
  }, [user]);

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-primary/30 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="flex flex-col gap-2">
            <span className="pixel-heading text-lg text-accent sm:text-xl">Push2Cart</span>
            <span className="text-xs font-medium uppercase tracking-[0.35em] text-secondary">
              Play. Shop. Save.
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-none border border-transparent px-3 py-2 transition-colors hover:border-secondary/40 hover:text-white",
                  pathname === link.href && "border-primary/50 bg-card text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/cart" className="pixel-border px-3 py-2 text-white">
              Cart ({itemCount})
            </Link>
            {user ? (
              <>
                <Link href="/account" className="px-3 py-2 hover:text-accent">
                  Account
                </Link>
                <Link href="/orders" className="px-3 py-2 hover:text-accent">
                  Orders
                </Link>
                {isAdmin ? (
                  <Link href="/admin/orders" className="px-3 py-2 hover:text-accent">
                    Admin
                  </Link>
                ) : null}
                <button onClick={handleLogout} className="px-3 py-2 hover:text-accent">
                  Logout
                </button>
              </>
            ) : (
              <Link href="/auth" className="pixel-border pixel-border-cyan px-3 py-2 text-white">
                Login
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
