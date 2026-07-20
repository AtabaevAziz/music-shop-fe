type ProductBrandInput = string | null | undefined;

export function normalizeProductBrand(brand: ProductBrandInput) {
  if (typeof brand === "string") {
    return brand.trim();
  }

  return "";
}
