import { Suspense } from "react";
import { AuthForms } from "@/components/auth-forms";
import { SectionHeading } from "@/components/section-heading";

export default function AuthPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center space-y-8 text-center">
        <SectionHeading
          eyebrow="Account"
          title="Login Or Create Your Save Slot"
          description="Sign in to save your cart, checkout faster, and keep your rewards."
        />
        <Suspense fallback={null}>
          <AuthForms />
        </Suspense>
      </div>
    </div>
  );
}
