import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type SecurityEventInput = {
  event_type: string;
  severity?: "info" | "warning";
  user_id?: string | null;
  request: Request;
  details?: Record<string, unknown>;
};

function getRequestIdentifier(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0]?.trim() || realIp?.trim();
  return ip ?? request.headers.get("user-agent") ?? "unknown";
}

export async function logSecurityEvent({
  event_type,
  severity = "warning",
  user_id = null,
  request,
  details = {}
}: SecurityEventInput) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return;
  }

  await supabase.from("security_events").insert({
    event_type,
    severity,
    user_id,
    request_identifier: getRequestIdentifier(request),
    details
  });
}
