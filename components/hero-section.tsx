import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-10 sm:py-16">
      <div className="scan-lines pixel-panel pixel-border relative overflow-hidden p-6 sm:p-10">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="pixel-heading text-3xl text-white sm:text-5xl">
                Push2Cart
                <span className="block mt-3 text-base sm:text-xl text-accent">Play. Shop. Save.</span>
              </h1>
              <p className="max-w-2xl text-base text-white/80 sm:text-lg">
                Easy shopping with a fun pixel touch.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link href="/products" className="pixel-border px-5 py-4 text-sm pixel-button">
                Start Shopping
              </Link>
              <Link
                href="/game"
                className="pixel-border pixel-border-yellow px-5 py-4 text-sm pixel-button"
              >
                Play Now
              </Link>
            </div>
          </div>
          <div className="pixel-border pixel-border-cyan pixel-panel relative mx-auto w-full max-w-md p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-secondary">
                <span>Live Perks</span>
                <span>COD Ready</span>
              </div>
              <div className="grid gap-3">
                {[
                  "Daily claw machine with voucher rewards",
                  "Keep your cart when you log in",
                  "Tracked deliveries from placed to delivered"
                ].map((item) => (
                  <div key={item} className="border border-white/10 bg-background/60 px-4 py-4">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
