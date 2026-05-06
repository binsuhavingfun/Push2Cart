export type ShippingAddressInput = {
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  barangay: string;
  city: string;
  province: string;
  postalCode: string;
  deliveryNotes?: string;
};

export type ShippingValidationErrors = Partial<Record<keyof ShippingAddressInput, string>>;

const PH_PHONE_REGEX = /^(09\d{9}|\+639\d{9})$/;
const PH_POSTAL_CODE_REGEX = /^\d{4}$/;
const NCR_REGION_ALIASES = ["metro manila", "ncr", "national capital region"] as const;
export const NCR_CITIES = [
  "Caloocan",
  "Las Piñas",
  "Makati",
  "Malabon",
  "Mandaluyong",
  "Manila",
  "Marikina",
  "Muntinlupa",
  "Navotas",
  "Parañaque",
  "Pasay",
  "Pasig",
  "Pateros",
  "Quezon City",
  "San Juan",
  "Taguig",
  "Valenzuela"
] as const;

function cleanText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

function normalizeForLookup(value: string) {
  return cleanText(value).toLowerCase().replace(/\s+/g, " ");
}

export function isNcrRegion(value: string) {
  return NCR_REGION_ALIASES.includes(normalizeForLookup(value) as (typeof NCR_REGION_ALIASES)[number]);
}

export function isNcrCity(value: string) {
  return NCR_CITIES.some((city) => city.toLowerCase() === normalizeForLookup(value));
}

export function normalizeShippingAddress(input: ShippingAddressInput): ShippingAddressInput {
  return {
    fullName: cleanText(input.fullName),
    phoneNumber: cleanText(input.phoneNumber),
    streetAddress: cleanText(input.streetAddress),
    barangay: cleanText(input.barangay),
    city: cleanText(input.city),
    province: cleanText(input.province),
    postalCode: cleanText(input.postalCode),
    deliveryNotes: cleanText(input.deliveryNotes ?? "")
  };
}

export function validateShippingAddress(input: ShippingAddressInput): ShippingValidationErrors {
  const value = normalizeShippingAddress(input);
  const errors: ShippingValidationErrors = {};

  if (!value.fullName) {
    errors.fullName = "Full name is required.";
  }

  if (!value.phoneNumber) {
    errors.phoneNumber = "Phone number is required.";
  } else if (!PH_PHONE_REGEX.test(value.phoneNumber)) {
    errors.phoneNumber =
      "Please enter a valid Philippine phone number (09XXXXXXXXX or +639XXXXXXXXX).";
  }

  if (!value.streetAddress) {
    errors.streetAddress = "Street address is required.";
  }

  if (!value.barangay) {
    errors.barangay = "Please enter a valid barangay.";
  }

  if (!value.city) {
    errors.city = "City or municipality is required.";
  } else if (isNcrRegion(value.province) && !isNcrCity(value.city)) {
    errors.city = "Please select a valid NCR city or municipality.";
  }

  if (!value.province) {
    errors.province = "Province or region is required.";
  }

  if (!value.postalCode) {
    errors.postalCode = "Postal code is required.";
  } else if (!PH_POSTAL_CODE_REGEX.test(value.postalCode)) {
    errors.postalCode = "Postal code must be exactly 4 numeric digits.";
  }

  return errors;
}

export function getDeliveryEstimate(province: string) {
  if (isNcrRegion(province)) {
    return {
      days: "2-4 days",
      label: "2-4 days",
      areaLabel: "NCR / Metro Manila",
      regionType: "metro"
    } as const;
  }

  return {
    days: "4-7 days",
    label: "4-7 days",
    areaLabel: "Provincial area",
    regionType: "provincial"
  } as const;
}

export function buildAddressLine(input: ShippingAddressInput) {
  const value = normalizeShippingAddress(input);
  return [value.streetAddress, value.barangay, value.city, value.province, value.postalCode]
    .filter(Boolean)
    .join(", ");
}
