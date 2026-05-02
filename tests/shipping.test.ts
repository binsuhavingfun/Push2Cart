import { describe, expect, it } from "vitest";
import {
  buildAddressLine,
  getDeliveryEstimate,
  normalizeShippingAddress,
  validateShippingAddress
} from "@/lib/shipping";

describe("shipping helpers", () => {
  it("normalizes whitespace across shipping fields", () => {
    expect(
      normalizeShippingAddress({
        fullName: "  Juan Dela Cruz  ",
        phoneNumber: " 09171234567 ",
        streetAddress: "  123  Arcade   Street ",
        barangay: "  Barangay 1 ",
        city: "  Quezon City ",
        province: " Metro Manila ",
        postalCode: " 1100 ",
        deliveryNotes: "  Ring   twice "
      })
    ).toEqual({
      fullName: "Juan Dela Cruz",
      phoneNumber: "09171234567",
      streetAddress: "123  Arcade   Street",
      barangay: "Barangay 1",
      city: "Quezon City",
      province: "Metro Manila",
      postalCode: "1100",
      deliveryNotes: "Ring   twice"
    });
  });

  it("returns validation errors for invalid checkout shipping input", () => {
    expect(
      validateShippingAddress({
        fullName: "",
        phoneNumber: "12345",
        streetAddress: "",
        barangay: "",
        city: "",
        province: "",
        postalCode: "ABC",
        deliveryNotes: ""
      })
    ).toMatchObject({
      fullName: "Full name is required.",
      phoneNumber: "Please enter a valid Philippine phone number (09XXXXXXXXX or +639XXXXXXXXX).",
      streetAddress: "Street address is required.",
      barangay: "Please enter a valid barangay.",
      city: "City or municipality is required.",
      province: "Province is required.",
      postalCode: "Postal code must be numeric."
    });
  });

  it("builds the legacy address line in the expected order", () => {
    expect(
      buildAddressLine({
        fullName: "Juan Dela Cruz",
        phoneNumber: "09171234567",
        streetAddress: "123 Arcade Street",
        barangay: "Barangay 1",
        city: "Quezon City",
        province: "Metro Manila",
        postalCode: "1100",
        deliveryNotes: ""
      })
    ).toBe("123 Arcade Street, Barangay 1, Quezon City, Metro Manila, 1100");
  });

  it("returns the correct delivery estimate for Metro Manila and provincial areas", () => {
    expect(getDeliveryEstimate("Metro Manila")).toMatchObject({
      days: "2-4 days",
      areaLabel: "Metro Manila",
      regionType: "metro"
    });

    expect(getDeliveryEstimate("Laguna")).toMatchObject({
      days: "4-7 days",
      areaLabel: "Provincial area",
      regionType: "provincial"
    });
  });
});
