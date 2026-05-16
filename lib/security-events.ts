import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestIdentifier } from "@/lib/request-identifiers";
type SecurityEventInput = {
  event_type: string;
  severity?: "info" | "warning";
  user_id?: string | null;
  request: Request;
  details?: Record<string, unknown>;
};

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
