import type {
  ApiStorefrontProduct,
  StorefrontProduct,
} from "@/services/storefront/storefront-types";

export function fromApiStorefrontProduct(
  product: ApiStorefrontProduct,
): StorefrontProduct {
  return {
    ...product,
    primaryImage: product.primaryImage || undefined,
  };
}
