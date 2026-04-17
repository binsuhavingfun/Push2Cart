import { SectionHeading } from "@/components/section-heading";

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="About"
        title="Commerce With Arcade Energy"
        description="Push2Cart offers a simple shopping experience with fun reward moments along the way. The pixel-style design stays focused on useful interactions so everything remains clear and easy to use—paano naman sa mobile? Smooth din. Built in the Philippines, Push2Cart keeps things playful without being over naman sa ask for everyday use."
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

