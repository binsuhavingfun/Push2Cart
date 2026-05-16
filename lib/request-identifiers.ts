function firstForwardedAddress(value: string | null) {
  return value?.split(",")[0]?.trim() || null;
}

export function getRequestIp(request: Request) {
  return (
    firstForwardedAddress(request.headers.get("x-forwarded-for")) ||
    firstForwardedAddress(request.headers.get("x-vercel-forwarded-for")) ||
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    null
  );
}

export function getRequestIdentifier(request: Request, userId?: string | null) {
  if (userId) {
    return `user:${userId}`;
  }

  const ip = getRequestIp(request);

  if (ip) {
    return `ip:${ip}`;
  }

  const userAgent = request.headers.get("user-agent") ?? "anonymous";
  const language = request.headers.get("accept-language") ?? "unknown";

  return `anon:${userAgent}:${language}`;
}
