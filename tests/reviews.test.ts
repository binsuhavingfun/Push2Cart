import { beforeEach, describe, expect, it, vi } from "vitest";

const getSupabaseServerClientMock = vi.fn();
const enforceRateLimitMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: getSupabaseServerClientMock
}));

vi.mock("@/lib/rate-limit", () => ({
  enforceRateLimit: enforceRateLimitMock
}));

function createSupabaseMock(options: {
  ordered: boolean;
  reviewInsertError?: { code?: string; message?: string } | null;
  ratings?: Array<{ rating: number }>;
}) {
  const orderItemsSelect = vi.fn(() => ({
    eq: vi.fn(() =>
      Promise.resolve({
        data: options.ordered ? [{ order_id: "order-1" }] : [],
        error: null
      })
    )
  }));
  const ordersSelect = vi.fn(() => ({
    eq: vi.fn(() => ({
      in: vi.fn(() => ({
        limit: vi.fn(() =>
          Promise.resolve({
            data: options.ordered ? [{ id: "order-1" }] : [],
            error: null
          })
        )
      }))
    }))
  }));
  const reviewInsertSingle = vi.fn(() =>
    Promise.resolve(
      options.reviewInsertError
        ? {
            data: null,
            error: options.reviewInsertError
          }
        : {
            data: {
              id: "review-1",
              user_id: "user-1",
              product_id: "prod-1",
              rating: 5,
              comment: "Great product",
              created_at: "2026-06-07T00:00:00.000Z",
              username: "tester"
            },
            error: null
          }
    )
  );
  const reviewSelectEq = vi.fn(() =>
    Promise.resolve({
      data: options.ratings ?? [{ rating: 5 }],
      error: null
    })
  );

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "user-1", email: "tester@example.com" } }
      })
    },
    from: vi.fn((table: string) => {
      if (table === "order_items") {
        return {
          select: orderItemsSelect
        };
      }

      if (table === "orders") {
        return {
          select: ordersSelect
        };
      }

      if (table === "reviews") {
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: reviewInsertSingle
            }))
          })),
          select: vi.fn(() => ({
            eq: reviewSelectEq
          }))
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    })
  };
}

beforeEach(() => {
  getSupabaseServerClientMock.mockReset();
  enforceRateLimitMock.mockReset();
  enforceRateLimitMock.mockResolvedValue(null);
});

describe("review API", () => {
  it("allows a user who ordered the product to review it", async () => {
    const supabase = createSupabaseMock({
      ordered: true,
      ratings: [{ rating: 5 }, { rating: 4 }]
    });
    getSupabaseServerClientMock.mockResolvedValue(supabase);

    const { POST } = await import("@/app/api/reviews/route");
    const response = await POST(
      new Request("https://example.com/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          productId: "prod-1",
          rating: 5,
          comment: "Great product"
        })
      })
    );

    const body = (await response.json()) as {
      review?: { product_id: string };
      average?: number;
    };

    expect(response.status).toBe(200);
    expect(body.review?.product_id).toBe("prod-1");
    expect(body.average).toBe(4.5);
  });

  it("rejects a user who has not ordered the product", async () => {
    const supabase = createSupabaseMock({ ordered: false });
    getSupabaseServerClientMock.mockResolvedValue(supabase);

    const { POST } = await import("@/app/api/reviews/route");
    const response = await POST(
      new Request("https://example.com/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          productId: "prod-1",
          rating: 5,
          comment: "Great product"
        })
      })
    );

    const body = (await response.json()) as { error?: string };

    expect(response.status).toBe(403);
    expect(body.error).toBe("You need to purchase this product to review it.");
  });
});
