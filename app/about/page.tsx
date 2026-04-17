import { SectionHeading } from "@/components/section-heading";

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="About"
        title="Commerce With Arcade Energy"
        description="Push2Cart blends a clean shopping journey with playful reward moments. The pixel treatment stays focused on interactive elements, keeping the UI readable on mobile while still feeling distinct."
      />
      <div className="pixel-border pixel-panel max-w-4xl p-6 text-white/80">
        <p>
          The app is built with Next.js App Router, TypeScript, Tailwind CSS v4, and
          Supabase. It supports guest shopping, account-based cart sync, COD checkout,
          order tracking, and a daily claw machine that awards account-bound vouchers.
        </p>
      </div>
    </div>
  );
}
