import {
  resolveMediaPath,
  resolveProductMediaPath,
  resolveProductMediaPaths,
} from "@/lib/media";
import { normalizeProductBrand } from "@/lib/product-brand";
import type {
  ApiStorefrontProduct,
  StorefrontProduct,
} from "@/services/storefront/storefront-types";

export function fromApiStorefrontProduct(
  product: ApiStorefrontProduct,
): StorefrontProduct {
  return {
    ...product,
    brand: normalizeProductBrand(product.brand),
    category: {
      ...product.category,
      image: resolveMediaPath(product.category.image),
    },
    images: resolveProductMediaPaths(product.images),
    primaryImage: resolveProductMediaPath(product.primaryImage),
  };
}
