import Link from "next/link";

const helpfulLinks = [
  { href: "/about", label: "About" },
  { href: "/products", label: "Products" },
  { href: "/game", label: "Mini Game" },
  { href: "/report", label: "Report" }
];

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-primary/25 bg-card/70">
      <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-8 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div className="pixel-border pixel-panel p-5">
          <p className="pixel-heading text-sm text-accent">Push2Cart</p>
          <p className="mt-3 text-xs font-medium uppercase tracking-[0.32em] text-secondary">
            Play. Shop. Save.
          </p>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/70">
            A retro arcade storefront where browsing products, winning vouchers, and checking out
            stay playful without making the shopping flow harder.
          </p>
        </div>

        <div className="pixel-border pixel-panel p-5">
          <p className="pixel-heading text-xs text-white">Helpful Links</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-white/75">
            {helpfulLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

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

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 pb-6 text-[11px] uppercase tracking-[0.24em] text-white/45 sm:px-6 sm:text-xs lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p>© 2026 Push2Cart. Built with arcade energy.</p>
        <p>Creator contact now lives in the footer so the main nav stays focused.</p>
      </div>
    </footer>
  );
}
