import { describe, expect, it } from "vitest";
import { getRequestIdentifier, getRequestIp } from "@/lib/request-identifiers";

describe("request identifier helpers", () => {
  it("prefers the authenticated user id when available", () => {
    const request = new Request("https://example.com");

    expect(getRequestIdentifier(request, "user-123")).toBe("user:user-123");
  });

  it("uses the first forwarded IP when present", () => {
    const request = new Request("https://example.com", {
      headers: {
        "x-forwarded-for": "203.0.113.10, 10.0.0.1"
      }
    });

    expect(getRequestIp(request)).toBe("203.0.113.10");
    expect(getRequestIdentifier(request)).toBe("ip:203.0.113.10");
  });

  it("falls back to a stable anonymous fingerprint", () => {
    const request = new Request("https://example.com", {
      headers: {
        "user-agent": "TestAgent/1.0",
        "accept-language": "en-PH"
      }
    });

    expect(getRequestIdentifier(request)).toBe("anon:TestAgent/1.0:en-PH");
  });
});
