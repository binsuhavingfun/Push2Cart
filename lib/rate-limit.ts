import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type RateLimitOptions = {
  request: Request;
  scope: string;
  limit: number;
  windowSeconds: number;
  userId?: string | null;
  message: string;
};

function getRequestIdentifier(request: Request, userId?: string | null) {
  if (userId) {
    return `user:${userId}`;
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const fallback = request.headers.get("user-agent") ?? "anonymous";
  const ip = forwardedFor?.split(",")[0]?.trim() || realIp?.trim();

  return ip ? `ip:${ip}` : `anon:${fallback}`;
}

export async function enforceRateLimit({
  request,
  scope,
  limit,
  windowSeconds,
  userId,
  message
}: RateLimitOptions) {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const identifier = getRequestIdentifier(request, userId);
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_scope: scope,
    p_identifier: identifier,
    p_max_requests: limit,
    p_window_seconds: windowSeconds
  });

  if (error) {
    return NextResponse.json({ error: "Unable to verify request rate right now." }, { status: 500 });
  }

  if (!data?.allowed) {
    return NextResponse.json({ error: message }, { status: 429 });
  }

  return null;
}
