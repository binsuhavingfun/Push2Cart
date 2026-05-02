"use client";

import { useEffect } from "react";
import NextError from "next/error";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="pixel-border pixel-panel w-full max-w-xl p-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
              System Error
            </p>
            <h2 className="pixel-heading mt-4 text-2xl text-white sm:text-3xl">
              Something went wrong
            </h2>
            <p className="mt-4 text-white/70">
              Push2Cart hit an unexpected issue. Please refresh the page and try again.
            </p>
            <div className="mt-6">
              <NextError statusCode={0} />
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
