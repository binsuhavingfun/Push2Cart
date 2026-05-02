import { beforeEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.fn();
const getSupabaseServerClientMock = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: redirectMock
}));

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: getSupabaseServerClientMock
}));

describe("requireUser", () => {
  beforeEach(() => {
    redirectMock.mockReset();
    getSupabaseServerClientMock.mockReset();
  });

  it("redirects to login when Supabase is unavailable", async () => {
    getSupabaseServerClientMock.mockResolvedValue(null);
    redirectMock.mockImplementation(() => {
      throw new Error("redirected");
    });

    const { requireUser } = await import("@/lib/auth");

    await expect(requireUser("/checkout")).rejects.toThrow("redirected");
    expect(redirectMock).toHaveBeenCalledWith("/auth?next=%2Fcheckout");
  });

  it("redirects to login when there is no authenticated user", async () => {
    getSupabaseServerClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } })
      }
    });
    redirectMock.mockImplementation(() => {
      throw new Error("redirected");
    });

    const { requireUser } = await import("@/lib/auth");

    await expect(requireUser("/orders")).rejects.toThrow("redirected");
    expect(redirectMock).toHaveBeenCalledWith("/auth?next=%2Forders");
  });

  it("returns the Supabase client and user when authenticated", async () => {
    const supabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } })
      }
    };
    getSupabaseServerClientMock.mockResolvedValue(supabase);

    const { requireUser } = await import("@/lib/auth");

    await expect(requireUser("/orders")).resolves.toEqual({
      supabase,
      user: { id: "user-1" }
    });
  });
});
