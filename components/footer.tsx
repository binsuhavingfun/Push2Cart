"use client";

import Link from "next/link";
import { useAdminStatus } from "@/hooks/use-admin-status";
import { useAuth } from "@/hooks/use-auth";

const guestLinks = [
  { href: "/products", label: "Products" },
  { href: "/game", label: "Mini Game" },
  { href: "/about", label: "About" },
  { href: "/report", label: "Report" }
];

const customerLinks = [...guestLinks, { href: "/account", label: "Profile" }];

export function Footer() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminStatus();

  const isAdminView = isAdmin && !adminLoading;
  const footerLinks = user ? customerLinks : guestLinks;

  return (
    <footer className="relative z-10 border-t border-primary/25 bg-card/70">
      <div
        className={`mx-auto grid w-full max-w-7xl gap-4 px-4 py-8 sm:px-6 lg:px-8 ${
          isAdminView ? "lg:grid-cols-[1.5fr_1fr]" : "lg:grid-cols-[1.4fr_1fr_1fr]"
        }`}
      >
        <div className="pixel-border pixel-panel p-5">
          <p className="pixel-heading text-sm text-accent">
            {isAdminView ? "Push2Cart Admin" : "Push2Cart"}
          </p>
          <p className="mt-3 text-xs font-medium uppercase tracking-[0.32em] text-secondary">
            Play. Shop. Save.
          </p>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/70">
            {isAdminView
              ? "Admin tools and store updates."
              : "A retro arcade storefront for products, prizes, and easy checkout."}
          </p>
        </div>

        {!isAdminView ? (
          <div className="pixel-border pixel-panel p-5">
            <p className="pixel-heading text-xs text-white">Explore</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/75">
              {footerLinks.map((link) => (
                <Link key={link.href} href={link.href} className="transition-colors hover:text-white">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <div className="pixel-border pixel-panel p-5">
          <p className="pixel-heading text-xs text-white">Creator Contact</p>
          <div className="mt-4 space-y-3 text-sm text-white/75">
            <a
              href="mailto:vincetarogpaglicawan@gmail.com"
              className="block transition-colors hover:text-white"
            >
              vincetarogpaglicawan@gmail.com
            </a>
            <a
              href="https://github.com/binsuhavingfun"
              target="_blank"
              rel="noopener noreferrer"
              className="block break-all transition-colors hover:text-white"
            >
              https://github.com/binsuhavingfun
            </a>
            <p>Open daily, 9:00 AM - 6:00 PM (Philippine Time, GMT+8)</p>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl justify-center px-4 pb-6 text-center text-[11px] uppercase tracking-[0.24em] text-white/45 sm:px-6 sm:text-xs lg:px-8">
        <p>&copy; 2026 Push2Cart. Built with arcade energy.</p>
      </div>
    </footer>
  );
}
