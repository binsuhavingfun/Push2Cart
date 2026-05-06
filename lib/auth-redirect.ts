const DEFAULT_LOCAL_URL = "http://localhost:3000";

export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_RESET_PATH = "/auth/reset-password";

export function getAppBaseUrl(origin?: string) {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    origin ??
    DEFAULT_LOCAL_URL;

  const normalizedUrl = envUrl.startsWith("http") ? envUrl : `https://${envUrl}`;
  return normalizedUrl.endsWith("/") ? normalizedUrl.slice(0, -1) : normalizedUrl;
}

export function getPasswordResetRedirectUrl(origin?: string) {
  const baseUrl = getAppBaseUrl(origin);
  const callbackUrl = new URL("/auth/callback", `${baseUrl}/`);
  callbackUrl.searchParams.set("redirect_to", PASSWORD_RESET_PATH);
  return callbackUrl.toString();
}

export function normalizeInternalPath(path: string | null | undefined, fallback = "/") {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return fallback;
  }

  return path;
}
