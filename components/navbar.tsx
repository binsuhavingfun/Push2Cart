"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminStatus } from "@/hooks/use-admin-status";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/game", label: "Mini Game" },
  { href: "/about", label: "About" },
  { href: "/report", label: "Report" }
];

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/profile", label: "Profile" }
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { itemCount } = useCart();
  const { isAdmin, loading: adminLoading } = useAdminStatus();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
  const desktopLinkClasses =
    "rounded-none border border-transparent px-3 py-2 transition-colors hover:border-secondary/40 hover:bg-card/70 hover:text-white";
  const accentLinkClasses =
    "pixel-border px-3 py-2 text-white transition-transform hover:-translate-y-0.5";
  const authLinkClasses =
    "pixel-border pixel-border-cyan px-3 py-2 text-white transition-transform hover:-translate-y-0.5";
  const utilityLinkClasses = "px-3 py-2 transition-colors hover:text-accent";
  const currentLinks = user && adminLoading ? [] : isAdmin ? adminLinks : links;

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-primary/30 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-5 xl:gap-8">
          <Link href="/" className="flex shrink-0 flex-col gap-1">
            <span className="pixel-heading text-lg text-accent sm:text-xl">
              {isAdmin ? "Push2Cart Admin" : "Push2Cart"}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.32em] text-secondary sm:text-xs">
              Play. Shop. Save.
            </span>
          </Link>

          <nav className="hidden items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/80 lg:flex xl:gap-2">
            {currentLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={closeMobileMenu}
                className={cn(
                  desktopLinkClasses,
                  pathname === link.href && "border-primary/50 bg-card text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
            {!isAdmin && !adminLoading ? (
              <>
                <Link href="/cart" onClick={closeMobileMenu} className={accentLinkClasses}>
                  Cart ({itemCount})
                </Link>
                {user ? (
                  <Link href="/account" onClick={closeMobileMenu} className={utilityLinkClasses}>
                    Profile
                  </Link>
                ) : null}
              </>
            ) : null}
          </nav>
        </div>

        <div className="hidden items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/85 lg:flex xl:gap-2">
          {user ? (
            <>
              {isAdmin && !adminLoading ? (
                <button onClick={handleLogout} className={utilityLinkClasses}>
                  Logout
                </button>
              ) : null}
            </>
          ) : (
            <Link href="/auth" onClick={closeMobileMenu} className={authLinkClasses}>
              Login
            </Link>
          )}
        </div>

        <button
          type="button"
          className="pixel-border flex h-10 w-10 shrink-0 items-center justify-center text-white lg:hidden"
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

      <nav
        id="mobile-nav-menu"
        className={cn(
          "mx-auto max-w-7xl px-4 sm:px-6 lg:hidden",
          "overflow-hidden border-t border-primary/25 transition-all duration-200",
          isMobileMenuOpen ? "max-h-[70vh] pt-4" : "max-h-0 border-transparent pt-0"
        )}
      >
        <div className="flex max-h-[calc(70vh-1rem)] flex-col gap-2 overflow-y-auto pb-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/85">
          {currentLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={closeMobileMenu}
              className={cn(baseLinkClasses, pathname === link.href && "border-primary/50 bg-card text-white")}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              {!isAdmin && !adminLoading ? (
                <>
                  <Link href="/cart" onClick={closeMobileMenu} className={accentLinkClasses}>
                    Cart ({itemCount})
                  </Link>
                  {user ? (
                    <Link href="/account" onClick={closeMobileMenu} className="px-3 py-2 hover:text-accent">
                      Profile
                    </Link>
                  ) : null}
                </>
              ) : null}
              {isAdmin && !adminLoading ? (
                <button onClick={handleLogout} className="px-3 py-2 text-left hover:text-accent">
                  Logout
                </button>
              ) : null}
            </>
          ) : (
            <Link href="/auth" onClick={closeMobileMenu} className={authLinkClasses}>
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
