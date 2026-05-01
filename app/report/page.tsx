"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/section-heading";

const reportTypes = ["Bug Report", "Website Feedback", "Suggestion"];

function FeedbackCartIllustration() {
  return (
    <div className="pixel-border pixel-panel relative mx-auto flex w-full max-w-md items-center justify-center overflow-hidden p-6 sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.16),_transparent_34%),radial-gradient(circle_at_bottom_right,_hsl(var(--secondary)/0.18),_transparent_36%)]" />

      <div className="relative w-full max-w-xs">
        <div className="absolute left-8 top-0 h-20 w-14 border-4 border-secondary bg-card shadow-[6px_6px_0_hsl(var(--shadow-cyan))]">
          <div className="border-b-2 border-secondary/50 px-2 py-1 font-pixel text-[8px] text-secondary">
            BUG
          </div>
          <div className="px-2 pt-2 text-[9px] text-white/70">fix pls</div>
        </div>

        <div className="absolute left-24 top-4 h-20 w-14 border-4 border-accent bg-card shadow-[6px_6px_0_hsl(var(--shadow-cyan))]">
          <div className="border-b-2 border-accent/50 px-2 py-1 font-pixel text-[8px] text-accent">
            NOTE
          </div>
          <div className="px-2 pt-2 text-[9px] text-white/70">idea++</div>
        </div>

        <div className="absolute left-40 top-8 h-20 w-14 border-4 border-primary bg-card shadow-[6px_6px_0_hsl(var(--shadow-cyan))]">
          <div className="border-b-2 border-primary/50 px-2 py-1 font-pixel text-[8px] text-primary">
            FEED
          </div>
          <div className="px-2 pt-2 text-[9px] text-white/70">thanks!</div>
        </div>

        <div className="relative mt-20 h-36">
          <div className="absolute left-4 top-12 h-16 w-44 skew-x-[-10deg] border-4 border-secondary bg-slate-950 shadow-[10px_10px_0_hsl(var(--primary))]" />
          <div className="absolute left-10 top-4 h-20 w-28 skew-x-[-10deg] border-4 border-primary/70 border-b-0" />
          <div className="absolute left-10 top-24 h-4 w-[8.5rem] border-b-4 border-secondary" />
          <div className="absolute left-2 top-0 h-16 w-4 bg-secondary" />
          <div className="absolute left-0 top-2 h-4 w-10 bg-secondary" />
          <div className="absolute left-[4.5rem] top-20 flex gap-4">
            <span className="h-10 w-10 rounded-full border-4 border-accent bg-card shadow-[4px_4px_0_hsl(var(--shadow-cyan))]" />
            <span className="h-10 w-10 rounded-full border-4 border-accent bg-card shadow-[4px_4px_0_hsl(var(--shadow-cyan))]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReportIssuePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reportType, setReportType] = useState("Bug Report");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage("");

    if (!message.trim()) {
      setStatusMessage("Message is required.");
      return;
    }

    setSubmitting(true);

    const response = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        reportType,
        message
      })
    });

    const payload = (await response.json()) as { error?: string; message?: string };

    if (!response.ok) {
      setStatusMessage(payload.error ?? "Unable to submit your report.");
      setSubmitting(false);
      return;
    }

    setStatusMessage(payload.message ?? "Thanks for the report. We appreciate your feedback.");
    setName("");
    setEmail("");
    setReportType("Bug Report");
    setMessage("");
    setSubmitting(false);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
      <div className="space-y-8">
        <SectionHeading
          eyebrow="Support"
          title="Report a Problem or Send Feedback"
          description="If something isn't working right or you have suggestions, let us know here."
        />

        <form onSubmit={handleSubmit} className="pixel-border pixel-panel space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="pixel-heading text-[10px] text-white">Name (optional)</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full border border-white/10 bg-background/60 px-4 py-3 outline-none focus:border-secondary"
              />
            </label>

            <label className="space-y-2">
              <span className="pixel-heading text-[10px] text-white">Email (optional)</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full border border-white/10 bg-background/60 px-4 py-3 outline-none focus:border-secondary"
              />
            </label>
          </div>

          <label className="space-y-2">
            <span className="pixel-heading text-[10px] text-white">Report Type</span>
            <select
              value={reportType}
              onChange={(event) => setReportType(event.target.value)}
              className="w-full border border-white/10 bg-background/60 px-4 py-3 outline-none focus:border-secondary"
            >
              {reportTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="pixel-heading text-[10px] text-white">Message</span>
            <textarea
              required
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Describe the issue or suggestion here."
              className="min-h-36 w-full border border-white/10 bg-background/60 px-4 py-3 outline-none focus:border-secondary"
            />
          </label>

          <button type="submit" disabled={submitting} className="pixel-border px-5 py-3 text-xs">
            {submitting ? "Sending..." : "Send Report"}
          </button>

          {statusMessage ? <p className="text-sm text-secondary">{statusMessage}</p> : null}
        </form>
      </div>

      <div className="lg:pt-5">
        <FeedbackCartIllustration />
      </div>
    </div>
  );
}
