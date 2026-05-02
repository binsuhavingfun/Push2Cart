import Link from "next/link";
const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/report", label: "Report" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-of-use", label: "Terms of Use" }
];

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-primary/25 bg-card/70">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-5 px-4 py-8 text-center sm:px-6 lg:px-8">
        <Link href="/" className="pixel-heading text-base text-accent transition-colors hover:text-white">
          PUSH2CART
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs uppercase tracking-[0.2em] text-white/70">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="space-y-2 text-center text-[11px] text-white/45 sm:text-xs">
          <p>&copy; 2026 Push2Cart. Built for a gamified shopping experience.</p>
          <p>Push2Cart is a student project and is not affiliated with any third-party brands shown in sample content.</p>
        </div>
      </div>
    </footer>
  );
}
