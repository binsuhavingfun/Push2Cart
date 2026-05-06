"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { SectionHeading } from "@/components/section-heading";
import { PASSWORD_MIN_LENGTH } from "@/lib/auth-redirect";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function getRecoveryErrorFromHash() {
  if (typeof window === "undefined") {
    return "";
  }

  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return hashParams.get("error_description") ?? hashParams.get("error") ?? "";
}

function hasRecoveryHash() {
  if (typeof window === "undefined") {
    return false;
  }

  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return hashParams.get("type") === "recovery" || hashParams.has("access_token");
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkingLink, setCheckingLink] = useState(true);
  const [isRecoveryReady, setIsRecoveryReady] = useState(false);

  const helperText = useMemo(
    () => `Choose a new password with at least ${PASSWORD_MIN_LENGTH} characters.`,
    []
  );

  useEffect(() => {
    const linkError = searchParams.get("error") ?? getRecoveryErrorFromHash();

    if (linkError) {
      setError(linkError);
      setCheckingLink(false);
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setError("Add Supabase credentials in .env.local to enable authentication.");
      setCheckingLink(false);
      return;
    }

    let mounted = true;
    let recoveryTimeout: ReturnType<typeof setTimeout> | null = null;

    const applyRecoveryState = (event: AuthChangeEvent, session: Session | null) => {
      if (!mounted) {
        return;
      }

      if (recoveryTimeout) {
        window.clearTimeout(recoveryTimeout);
        recoveryTimeout = null;
      }

      if (event === "PASSWORD_RECOVERY") {
        setIsRecoveryReady(true);
        setCheckingLink(false);
        setError("");
        return;
      }

      if (session) {
        setIsRecoveryReady(true);
        setCheckingLink(false);
        setError("");
        return;
      }

      if (!hasRecoveryHash()) {
        setIsRecoveryReady(false);
        setCheckingLink(false);
        setError("This password reset link is missing, invalid, or has already expired.");
      }
    };

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!mounted) {
        return;
      }

      if (sessionError) {
        setError(sessionError.message);
        setCheckingLink(false);
        return;
      }

      applyRecoveryState("INITIAL_SESSION", data.session);

      if (!data.session && hasRecoveryHash()) {
        recoveryTimeout = setTimeout(() => {
          if (!mounted) {
            return;
          }

          setCheckingLink(false);
          setIsRecoveryReady(false);
          setError("This password reset link is missing, invalid, or has already expired.");
        }, 2000);
      }
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      applyRecoveryState(event, session);
    });

    return () => {
      mounted = false;
      if (recoveryTimeout) {
        clearTimeout(recoveryTimeout);
      }
      subscription.unsubscribe();
    };
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    if (!password) {
      setError("New password is required.");
      setSubmitting(false);
      return;
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      setError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters.`);
      setSubmitting(false);
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your new password.");
      setSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setSubmitting(false);
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setError("Authentication is not configured.");
      setSubmitting(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setSubmitting(false);
      return;
    }

    await supabase.auth.signOut();
    setMessage("Password updated. Redirecting you to login...");

    setTimeout(() => {
      router.push("/auth?reset=success");
      router.refresh();
    }, 1600);
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center space-y-8 text-center">
        <SectionHeading
          eyebrow="Security"
          title="Set New Password"
          description="Use the secure recovery link from your email to finish resetting your password."
        />

        <div className="pixel-border pixel-panel mx-auto w-full max-w-xl p-6 sm:p-8">
          {checkingLink ? (
            <p className="text-sm text-white/70">Verifying your reset link...</p>
          ) : null}

          {!checkingLink && !isRecoveryReady ? (
            <div className="space-y-4 text-left">
              <p className="text-sm text-secondary">{error}</p>
              <Link
                href="/auth/forgot-password"
                className="inline-flex text-xs text-white/70 transition-colors hover:text-accent"
              >
                Request a new reset link
              </Link>
            </div>
          ) : null}

          {!checkingLink && isRecoveryReady ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <label className="block space-y-2">
                <span className="pixel-heading text-[10px] text-white">New Password</span>
                <input
                  className="w-full border border-white/15 bg-background/60 px-4 py-3 outline-none focus:border-secondary"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                />
              </label>
              <label className="block space-y-2">
                <span className="pixel-heading text-[10px] text-white">Confirm Password</span>
                <input
                  className="w-full border border-white/15 bg-background/60 px-4 py-3 outline-none focus:border-secondary"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                />
              </label>
              <p className="text-xs text-white/60">{helperText}</p>
              <button
                type="submit"
                disabled={submitting}
                className="pixel-border w-full px-4 py-3 text-xs disabled:opacity-60"
              >
                {submitting ? "Updating..." : "Update Password"}
              </button>
              {error ? <p className="text-sm text-secondary">{error}</p> : null}
              {message ? <p className="text-sm text-accent">{message}</p> : null}
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-3xl space-y-8">
          <div className="mx-auto flex w-full max-w-2xl flex-col items-center space-y-8 text-center">
            <SectionHeading
              eyebrow="Security"
              title="Set New Password"
              description="Use the secure recovery link from your email to finish resetting your password."
            />
            <div className="pixel-border pixel-panel mx-auto w-full max-w-xl p-6 sm:p-8">
              <p className="text-sm text-white/70">Loading password reset...</p>
            </div>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
