import { NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/rate-limit";
import {
  REPORT_EMAIL_MAX_LENGTH,
  REPORT_MESSAGE_MAX_LENGTH,
  REPORT_NAME_MAX_LENGTH,
  REPORT_TYPE_MAX_LENGTH,
  isAllowedReportType
} from "@/lib/report-options";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isReasonableEmail, normalizeLongText, normalizeShortText } from "@/lib/validation";

type ReportPayload = {
  name?: string;
  email?: string;
  reportType?: string;
  message?: string;
};

function subjectLabel(reportType: string) {
  const normalized = reportType.trim().toLowerCase();
  if (normalized.includes("bug")) {
    return "Bug";
  }
  if (normalized.includes("feedback")) {
    return "Feedback";
  }
  return "Suggestion";
}

export async function POST(request: Request) {
  const rateLimitResponse = await enforceRateLimit({
    request,
    scope: "reports:create",
    limit: 5,
    windowSeconds: 3600,
    message: "Too many reports were submitted from this connection. Please try again later."
  });

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const payload = (await request.json()) as ReportPayload;

  const name = normalizeShortText(payload.name, REPORT_NAME_MAX_LENGTH);
  const email = normalizeShortText(payload.email, REPORT_EMAIL_MAX_LENGTH);
  const reportType = normalizeShortText(payload.reportType, REPORT_TYPE_MAX_LENGTH);
  const message = normalizeLongText(payload.message, REPORT_MESSAGE_MAX_LENGTH);

  if (!reportType) {
    return NextResponse.json({ error: "Please select a report type." }, { status: 400 });
  }

  if (!isAllowedReportType(reportType)) {
    return NextResponse.json({ error: "Please choose a valid report type." }, { status: 400 });
  }

  if (!message) {
    return NextResponse.json({ error: "Please enter your message." }, { status: 400 });
  }

  if (email && !isReasonableEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const reportReceiverEmail = process.env.REPORT_RECEIVER_EMAIL;

  if (!resendKey) {
    return NextResponse.json(
      { error: "Missing RESEND_API_KEY. Please configure report email sending first." },
      { status: 500 }
    );
  }

  if (!reportReceiverEmail) {
    return NextResponse.json(
      { error: "Missing REPORT_RECEIVER_EMAIL. Please configure report delivery first." },
      { status: 500 }
    );
  }

  const timestamp = new Date().toISOString();
  const label = subjectLabel(reportType);
  const subject = `[Push2Cart Report] ${label}`;

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendKey}`
    },
    body: JSON.stringify({
      from: process.env.REPORT_FROM_EMAIL ?? "Push2Cart Reports <onboarding@resend.dev>",
      to: [reportReceiverEmail],
      subject,
      text: [
        `Report Type: ${reportType}`,
        `Name: ${name || "N/A"}`,
        `Email: ${email || "N/A"}`,
        `Message: ${message}`,
        `Timestamp: ${timestamp}`
      ].join("\n")
    })
  });

  if (!emailResponse.ok) {
    const emailPayload = (await emailResponse.json().catch(() => null)) as
      | { message?: string }
      | null;
    return NextResponse.json(
      { error: emailPayload?.message ?? "Unable to send email report right now." },
      { status: 500 }
    );
  }

  const supabase = await getSupabaseServerClient();
  if (supabase) {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    await supabase.from("reports").insert({
      user_id: user?.id ?? null,
      name: name || null,
      email: email || null,
      report_type: reportType,
      message
    });
  }

  return NextResponse.json({ message: "Thanks for the report. We appreciate your feedback." });
}
