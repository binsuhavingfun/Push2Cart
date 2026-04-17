import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type ReportPayload = {
  name?: string;
  email?: string;
  reportType?: string;
  message?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUPPORT_EMAIL = "vincetarogpaglicawan@gmail.com";

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
  const payload = (await request.json()) as ReportPayload;

  const name = payload.name?.trim() ?? "";
  const email = payload.email?.trim() ?? "";
  const reportType = payload.reportType?.trim() ?? "";
  const message = payload.message?.trim() ?? "";

  if (!reportType) {
    return NextResponse.json({ error: "Please select a report type." }, { status: 400 });
  }

  if (!message) {
    return NextResponse.json({ error: "Please enter your message." }, { status: 400 });
  }

  if (email && !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json(
      { error: "Missing RESEND_API_KEY. Please configure report email sending first." },
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
      to: [process.env.REPORT_RECEIVER_EMAIL ?? SUPPORT_EMAIL],
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

  return NextResponse.json({ supportEmail: SUPPORT_EMAIL, message: "Thanks for the report. We appreciate your feedback." });
}
