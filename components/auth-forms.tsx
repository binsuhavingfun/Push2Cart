"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function AuthForms() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const nextPath = searchParams.get("next") ?? "/products";
  const authError = searchParams.get("error");
  const resetStatus = searchParams.get("reset");
  const statusMessage =
    resetStatus === "success"
      ? "Password updated. Please log in again with your new password."
      : authError;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setMessage("Add Supabase credentials in .env.local to enable authentication.");
      setSubmitting(false);
      return;
    }

    const action =
      mode === "login"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password });

    const { error } = await action;

    if (error) {
      setMessage(error.message);
      setSubmitting(false);
      return;
    }

    setMessage(mode === "login" ? "Login successful." : "Account created. You can start shopping.");
    router.push(nextPath);
    router.refresh();
  };

  return (
    <div className="pixel-border pixel-panel mx-auto w-full max-w-xl p-6 sm:p-8">
      <div className="flex gap-3 text-xs pixel-button">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={mode === "login" ? "text-accent" : "text-white/70"}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={mode === "signup" ? "text-accent" : "text-white/70"}
        >
          Sign Up
        </button>
      </div>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
        <label className="block space-y-2">
          <span className="pixel-heading text-[10px] text-white">Email</span>
          <input
            className="w-full border border-white/15 bg-background/60 px-4 py-3 outline-none focus:border-secondary"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label className="block space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="pixel-heading text-[10px] text-white">Password</span>
            {mode === "login" ? (
              <Link
                href="/auth/forgot-password"
                className="text-[10px] text-white/50 transition-colors hover:text-accent"
              >
                Forgot Password?
              </Link>
            ) : null}
          </div>
          <input
            className="w-full border border-white/15 bg-background/60 px-4 py-3 outline-none focus:border-secondary"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="pixel-border w-full px-4 py-3 text-xs disabled:opacity-60"
        >
          {submitting ? "Loading..." : mode === "login" ? "Login" : "Create Account"}
        </button>
        {statusMessage ? <p className="text-sm text-secondary">{statusMessage}</p> : null}
        {message ? <p className="text-sm text-secondary">{message}</p> : null}
      </form>
    </div>
  );
}
