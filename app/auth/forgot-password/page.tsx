"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import {
  PASSWORD_MIN_LENGTH,
  getPasswordResetRedirectUrl
} from "@/lib/auth-redirect";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const helperText = useMemo(
    () => `Use the email tied to your Push2Cart account. New passwords must be at least ${PASSWORD_MIN_LENGTH} characters.`,
    []
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Email is required.");
      setSubmitting(false);
      return;
    }

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setError("Enter a valid email address.");
      setSubmitting(false);
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setError("Add Supabase credentials in .env.local to enable authentication.");
      setSubmitting(false);
      return;
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: getPasswordResetRedirectUrl(window.location.origin)
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setMessage("If that email exists, a password reset link is on the way.");
      setEmail("");
    }

    setSubmitting(false);
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center space-y-8 text-center">
        <SectionHeading
          eyebrow="Recovery"
          title="Forgot Your Password?"
          description="Enter your email and we will send you a secure reset link."
        />

        <div className="pixel-border pixel-panel mx-auto w-full max-w-xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <label className="block space-y-2">
              <span className="pixel-heading text-[10px] text-white">Email</span>
              <input
                className="w-full border border-white/15 bg-background/60 px-4 py-3 outline-none focus:border-secondary"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </label>
            <p className="text-xs text-white/60">{helperText}</p>
            <button
              type="submit"
              disabled={submitting}
              className="pixel-border w-full px-4 py-3 text-xs disabled:opacity-60"
            >
              {submitting ? "Sending..." : "Send Reset Link"}
            </button>
            {error ? <p className="text-sm text-secondary">{error}</p> : null}
            {message ? <p className="text-sm text-accent">{message}</p> : null}
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth" className="text-xs text-white/50 transition-colors hover:text-white">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
