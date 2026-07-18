type ProductBrandInput =
  | string
  | {
      name?: string | null;
    }
  | null
  | undefined;

export function normalizeProductBrand(brand: ProductBrandInput) {
  if (typeof brand === "string") {
    return brand.trim();
  }

  if (
    brand &&
    typeof brand === "object" &&
    typeof brand.name === "string"
  ) {
    return brand.name.trim();
  }

  return "";
}
