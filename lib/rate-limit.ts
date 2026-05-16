import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestIdentifier } from "@/lib/request-identifiers";

type RateLimitOptions = {
  request: Request;
  scope: string;
  limit: number;
  windowSeconds: number;
  userId?: string | null;
  message: string;
};

type RateLimitResult = {
  allowed: boolean;
  count?: number;
  remaining?: number;
  reset_at?: string;
};

export async function enforceRateLimit({
  request,
  scope,
  limit,
  windowSeconds,
  userId,
  message
}: RateLimitOptions) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Missing SUPABASE_SERVICE_ROLE_KEY. Server-side rate limiting is not configured." },
      { status: 500 }
    );
  }

  const identifier = getRequestIdentifier(request, userId);
  const { data, error } = await supabase.rpc(
    "check_rate_limit",
    {
      p_scope: scope,
      p_identifier: identifier,
      p_max_requests: limit,
      p_window_seconds: windowSeconds
    } as never
  );

  if (error) {
    return NextResponse.json({ error: "Unable to verify request rate right now." }, { status: 500 });
  }

  const result = data as RateLimitResult | null;

  if (!result?.allowed) {
    return NextResponse.json({ error: message }, { status: 429 });
  }

  return null;
}
