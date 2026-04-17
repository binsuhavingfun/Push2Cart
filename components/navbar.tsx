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
  { href: "/contact", label: "Contact" },
  { href: "/report", label: "Report" }
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { itemCount } = useCart();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setIsMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const baseLinkClasses =
    "rounded-none border border-transparent px-3 py-2 transition-colors hover:border-secondary/40 hover:text-white";
  const cartClasses = "pixel-border px-3 py-2 text-white";
  const authLinkClasses = "pixel-border pixel-border-cyan px-3 py-2 text-white";

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-primary/30 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex flex-col gap-2">
            <span className="pixel-heading text-lg text-accent sm:text-xl">Push2Cart</span>
            <span className="text-xs font-medium uppercase tracking-[0.35em] text-secondary">
              Play. Shop. Save.
            </span>
          </Link>

          <button
            type="button"
            className="pixel-border flex h-10 w-10 items-center justify-center text-white lg:hidden"
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav-menu"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            <span className="sr-only">Toggle menu</span>
            <span className="flex flex-col gap-1.5">
              <span
                className={cn(
                  "block h-0.5 w-5 bg-white transition-transform duration-200",
                  isMobileMenuOpen && "translate-y-2 rotate-45"
                )}
              />
              <span
                className={cn(
                  "block h-0.5 w-5 bg-white transition-opacity duration-200",
                  isMobileMenuOpen && "opacity-0"
                )}
              />
              <span
                className={cn(
                  "block h-0.5 w-5 bg-white transition-transform duration-200",
                  isMobileMenuOpen && "-translate-y-2 -rotate-45"
                )}
              />
            </span>
          </button>
        </div>

        <nav className="hidden flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/80 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMobileMenu}
              className={cn(baseLinkClasses, pathname === link.href && "border-primary/50 bg-card text-white")}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/cart" onClick={closeMobileMenu} className={cartClasses}>
            Cart ({itemCount})
          </Link>
          {user ? (
            <>
              <Link href="/account" onClick={closeMobileMenu} className="px-3 py-2 hover:text-accent">
                Account
              </Link>
              <Link href="/orders" onClick={closeMobileMenu} className="px-3 py-2 hover:text-accent">
                Orders
              </Link>
              {isAdmin ? (
                <Link href="/admin/orders" onClick={closeMobileMenu} className="px-3 py-2 hover:text-accent">
                  Admin
                </Link>
              ) : null}
              <button onClick={handleLogout} className="px-3 py-2 hover:text-accent">
                Logout
              </button>
            </>
          ) : (
            <Link href="/auth" onClick={closeMobileMenu} className={authLinkClasses}>
              Login
            </Link>
          )}
        </nav>

        <nav
          id="mobile-nav-menu"
          className={cn(
            "lg:hidden",
            "overflow-hidden border-t border-primary/25 transition-all duration-200",
            isMobileMenuOpen ? "max-h-[70vh] pt-4" : "max-h-0 border-transparent pt-0"
          )}
        >
          <div className="flex max-h-[calc(70vh-1rem)] flex-col gap-2 overflow-y-auto pb-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/85">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                className={cn(baseLinkClasses, pathname === link.href && "border-primary/50 bg-card text-white")}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/cart" onClick={closeMobileMenu} className={cartClasses}>
              Cart ({itemCount})
            </Link>
            {user ? (
              <>
                <Link href="/account" onClick={closeMobileMenu} className="px-3 py-2 hover:text-accent">
                  Account
                </Link>
                <Link href="/orders" onClick={closeMobileMenu} className="px-3 py-2 hover:text-accent">
                  Orders
                </Link>
                {isAdmin ? (
                  <Link href="/admin/orders" onClick={closeMobileMenu} className="px-3 py-2 hover:text-accent">
                    Admin
                  </Link>
                ) : null}
                <button onClick={handleLogout} className="px-3 py-2 hover:text-accent">
                  Logout
                </button>
              </>
            ) : (
              <Link href="/auth" onClick={closeMobileMenu} className={authLinkClasses}>
                Login
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
