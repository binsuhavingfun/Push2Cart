const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string) {
  return UUID_REGEX.test(value.trim());
}

export function normalizeShortText(value: unknown, maxLength: number) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.slice(0, maxLength);
}

export function normalizeLongText(value: unknown, maxLength: number) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.replace(/\s+/g, " ").slice(0, maxLength);
}

export function isReasonableEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
