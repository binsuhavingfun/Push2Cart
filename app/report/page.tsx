"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/section-heading";

const reportTypes = ["Bug Report", "Website Feedback", "Suggestion"];

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
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Support"
        title="Report a Problem or Send Feedback"
        description="If something isn't working right or you have suggestions, let us know here."
      />

      <form onSubmit={handleSubmit} className="pixel-border pixel-panel max-w-3xl space-y-4 p-6">
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
  );
}
