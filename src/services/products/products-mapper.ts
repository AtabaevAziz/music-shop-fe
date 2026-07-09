import type { ApiProduct } from "@/services/products/products-types";
import type { Product } from "@/types/music";

export function fromApiProduct(product: ApiProduct): Product {
  return {
    ...product,
    barcode: product.barcode || undefined,
    primaryImage: product.primaryImage || undefined,
  };
}
