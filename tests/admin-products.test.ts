import { describe, expect, it } from "vitest";
import {
  buildProductId,
  normalizeAdminProductPayload,
  validateAdminProduct
} from "@/lib/admin-products";

describe("admin product helpers", () => {
  it("builds a product id from the name", () => {
    expect(buildProductId("Turbo Pad")).toBe("prod-turbo-pad");
  });

  it("normalizes admin product payload values", () => {
    expect(
      normalizeAdminProductPayload({
        id: "prod-sample",
        name: " Sample Product ",
        description: "  Clean   text  ",
        image_url: "/images/sample.svg",
        price: "499.99",
        stock: "12"
      })
    ).toEqual({
      id: "prod-sample",
      name: "Sample Product",
      description: "Clean text",
      image_url: "/images/sample.svg",
      price: 499.99,
      stock: 12
    });
  });

  it("rejects invalid admin product values", () => {
    expect(
      validateAdminProduct({
        id: "prod-sample",
        name: "",
        description: "Test",
        image_url: "/images/sample.svg",
        price: 100,
        stock: 5
      })
    ).toBe("Product name is required.");

    expect(
      validateAdminProduct({
        id: "prod-sample",
        name: "Sample",
        description: "Test",
        image_url: "/images/sample.svg",
        price: -1,
        stock: 5
      })
    ).toBe("Enter a valid price.");
  });
});
