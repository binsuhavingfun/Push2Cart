import { beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.fn();
const redirectMock = vi.fn();
const requireUserMock = vi.fn();

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
  redirect: redirectMock
}));

vi.mock("@/lib/auth", () => ({
  requireUser: requireUserMock
}));

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: vi.fn()
}));

describe("admin role helpers", () => {
  beforeEach(() => {
    notFoundMock.mockReset();
    redirectMock.mockReset();
    requireUserMock.mockReset();
  });

  it("detects admin membership from the admin_users table", async () => {
    const supabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({ data: { user_id: "admin-1" } })
          }))
        }))
      }))
    };

    const { isAdminUser } = await import("@/lib/admin");

    await expect(isAdminUser(supabase, "admin-1")).resolves.toBe(true);
  });

  it("blocks non-admins from requireAdmin", async () => {
    const supabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({ data: null })
          }))
        }))
      }))
    };
    requireUserMock.mockResolvedValue({ supabase, user: { id: "user-1" } });
    notFoundMock.mockImplementation(() => {
      throw new Error("not-found");
    });

    const { requireAdmin } = await import("@/lib/admin");

    await expect(requireAdmin("/admin")).rejects.toThrow("not-found");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("redirects admins away from customer-only routes", async () => {
    const supabase = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({ data: { user_id: "admin-1" } })
          }))
        }))
      }))
    };
    requireUserMock.mockResolvedValue({ supabase, user: { id: "admin-1" } });
    redirectMock.mockImplementation(() => {
      throw new Error("redirected");
    });

    const { requireCustomerUser } = await import("@/lib/admin");

    await expect(requireCustomerUser("/checkout")).rejects.toThrow("redirected");
    expect(redirectMock).toHaveBeenCalledWith("/admin");
  });
});
