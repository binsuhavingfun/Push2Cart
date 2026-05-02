import { normalizeLongText, normalizeShortText } from "@/lib/validation";

export type AdminProductValues = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  stock: number;
};

export function buildProductId(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return slug ? `prod-${slug}` : "";
}

export function normalizeAdminProductPayload(payload: unknown): AdminProductValues {
  const value = typeof payload === "object" && payload ? (payload as Record<string, unknown>) : {};
  const normalizedName = normalizeShortText(value.name, 120);

  return {
    id: normalizeShortText(value.id, 80),
    name: normalizedName,
    description: normalizeLongText(value.description, 500),
    image_url: normalizeShortText(value.image_url, 240),
    price: Number(value.price),
    stock: Math.trunc(Number(value.stock))
  };
}

export function validateAdminProduct(values: AdminProductValues) {
  if (!values.name) {
    return "Product name is required.";
  }

  if (!values.description) {
    return "Product description is required.";
  }

  if (!values.image_url) {
    return "Image path is required.";
  }

  if (!Number.isFinite(values.price) || values.price < 0) {
    return "Enter a valid price.";
  }

  if (!Number.isFinite(values.stock) || values.stock < 0) {
    return "Enter a valid stock amount.";
  }

  return null;
}
