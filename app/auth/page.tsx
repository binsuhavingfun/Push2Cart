import { Suspense } from "react";
import { AuthForms } from "@/components/auth-forms";
import { SectionHeading } from "@/components/section-heading";

export default function AuthPage() {
  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Account"
        title="Login Or Create Your Save Slot"
        description="Use email and password auth with Supabase, then pick up your synced cart, checkout flow, and mini-game rewards."
      />
      <Suspense fallback={null}>
        <AuthForms />
      </Suspense>
    </div>
  );
}
