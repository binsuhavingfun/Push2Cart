"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/section-heading";

const reportTypes = ["Bug Report", "Website Feedback", "Suggestion"];

function BugIllustration() {
  return (
    <div className="pixel-border pixel-panel relative mx-auto flex w-full max-w-md items-center justify-center overflow-hidden p-6 sm:p-8 lg:min-h-[31rem]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.14),_transparent_34%),radial-gradient(circle_at_bottom,_hsl(var(--secondary)/0.16),_transparent_38%)]" />

      <div className="relative flex w-full max-w-xs flex-col items-center">
        <div className="mb-6 border-2 border-secondary/40 bg-background/40 px-4 py-2 text-center font-pixel text-[9px] uppercase tracking-[0.24em] text-secondary shadow-[6px_6px_0_hsl(var(--shadow-cyan))] sm:text-[10px]">
          Bug Report
        </div>

        <div className="relative flex h-56 w-full items-center justify-center">
          <span className="absolute top-4 h-8 w-8 rounded-full border-4 border-secondary bg-slate-950 shadow-[0_0_0_4px_hsl(var(--primary)/0.45)]" />

          <span className="absolute top-2 left-[calc(50%-1.75rem)] h-7 w-[3px] -rotate-12 bg-secondary" />
          <span className="absolute top-2 left-[calc(50%+1.55rem)] h-7 w-[3px] rotate-12 bg-secondary" />
          <span className="absolute top-0 left-[calc(50%-2.2rem)] h-3 w-3 border-t-4 border-l-4 border-secondary" />
          <span className="absolute top-0 left-[calc(50%+1.55rem)] h-3 w-3 border-t-4 border-r-4 border-secondary" />

          <div className="absolute top-16 flex h-32 w-40 items-center justify-center rounded-[40%] border-4 border-primary bg-[linear-gradient(180deg,_hsl(350_80%_46%),_hsl(350_68%_36%))] shadow-[0_0_0_4px_hsl(var(--secondary)/0.22),10px_10px_0_hsl(var(--shadow-cyan))]">
            <span className="absolute inset-y-3 left-1/2 w-2 -translate-x-1/2 bg-slate-950" />
            <span className="absolute left-8 top-8 h-5 w-5 rounded-full bg-slate-950" />
            <span className="absolute right-8 top-8 h-5 w-5 rounded-full bg-slate-950" />
            <span className="absolute bottom-8 left-11 h-4 w-4 rounded-full bg-slate-950" />
            <span className="absolute bottom-8 right-11 h-4 w-4 rounded-full bg-slate-950" />
          </div>

          <div className="absolute top-[4.5rem] flex gap-5">
            <span className="h-2.5 w-2.5 bg-accent" />
            <span className="h-2.5 w-2.5 bg-accent" />
          </div>
          <div className="absolute top-[5.55rem] h-3 w-8 rounded-b-full border-b-[3px] border-secondary" />

          <span className="absolute left-[3.9rem] top-[7.35rem] h-10 w-[3px] rotate-45 bg-secondary/90" />
          <span className="absolute left-[3.4rem] top-[9.2rem] h-10 w-[3px] rotate-[72deg] bg-secondary/90" />
          <span className="absolute left-[4.9rem] top-[10.85rem] h-10 w-[3px] rotate-[105deg] bg-secondary/90" />
          <span className="absolute right-[3.9rem] top-[7.35rem] h-10 w-[3px] -rotate-45 bg-secondary/90" />
          <span className="absolute right-[3.4rem] top-[9.2rem] h-10 w-[3px] -rotate-[72deg] bg-secondary/90" />
          <span className="absolute right-[4.9rem] top-[10.85rem] h-10 w-[3px] -rotate-[105deg] bg-secondary/90" />
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
    <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-8">
      <div className="space-y-6">
        <SectionHeading
          eyebrow="Support"
          title="Report a Problem or Send Feedback"
          description="If something isn't working right or you have suggestions, let us know here."
        />

        <form onSubmit={handleSubmit} className="pixel-border pixel-panel mx-auto w-full max-w-2xl space-y-4 p-6">
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

      <div className="flex items-center justify-center lg:self-stretch">
        <BugIllustration />
      </div>
    </div>
  );
}
