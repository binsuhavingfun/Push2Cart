import { SectionHeading } from "@/components/section-heading";

function LaptopIllustration() {
  return (
    <div className="pixel-border pixel-panel relative mx-auto flex w-full max-w-md items-center justify-center overflow-hidden px-6 py-8 sm:px-8 sm:py-9">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_hsl(var(--secondary)/0.18),_transparent_34%),radial-gradient(circle_at_bottom,_hsl(var(--primary)/0.16),_transparent_38%)]" />

      <div className="relative flex w-full max-w-xs flex-col items-center">
        <div className="relative w-full rounded-none border-4 border-secondary bg-slate-950 px-4 pb-4 pt-5 shadow-[0_0_0_4px_hsl(var(--primary)),10px_10px_0_hsl(var(--shadow-cyan))]">
          <div className="absolute left-3 top-3 flex gap-1.5">
            <span className="h-2.5 w-2.5 bg-primary" />
            <span className="h-2.5 w-2.5 bg-accent" />
            <span className="h-2.5 w-2.5 bg-secondary" />
          </div>

          <div className="mt-5 rounded-none border-2 border-primary/60 bg-[linear-gradient(180deg,_hsl(240_20%_10%),_hsl(240_20%_14%))] p-4">
            <div className="space-y-1 font-mono text-[11px] leading-5 text-secondary sm:text-xs">
              <p>
                <span className="text-primary">cart</span>
                <span className="text-white/75">.</span>
                <span className="text-accent">add</span>
                <span className="text-white/75">(item);</span>
              </p>
              <p>
                <span className="text-accent">saveReward</span>
                <span className="text-white/75">();</span>
              </p>
            </div>
          </div>
        </div>

        <div className="relative mt-3 h-5 w-[88%] border-4 border-primary bg-muted shadow-[8px_8px_0_hsl(var(--shadow-cyan))]" />
        <div className="relative h-4 w-24 border-x-4 border-b-4 border-secondary bg-card" />
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10">
      <div className="space-y-6">
        <SectionHeading
          eyebrow="About"
          title="Commerce With Arcade Energy"
          description="Push2Cart is a gamified shopping website with a retro arcade style. Browse products, play the claw machine, earn vouchers, and track your orders in one place."
        />

        <div className="pixel-border pixel-panel p-6 text-white/80">
          <p className="leading-7">
            Shopping stays easy while the arcade touches make the experience feel more fun.
            You can explore products, win discounts from the claw machine, and keep up with
            your deliveries without leaving the site.
          </p>
          <p className="mt-4 leading-7 text-white/70">
            Built in the Philippines, Push2Cart mixes playful visuals with a practical flow
            that works well on both desktop and mobile.
          </p>
        </div>

        <div className="pixel-border pixel-panel p-5">
          <p className="pixel-heading text-xs text-white">Built With</p>
          <p className="mt-4 text-sm leading-6 text-white/75">
            Next.js App Router, TypeScript, Tailwind CSS v4, and Supabase.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center lg:self-center">
        <LaptopIllustration />
      </div>
    </div>
  );
}
