import { resolveProductMediaPath, resolveProductMediaPaths } from "@/lib/media";
import type { ApiMediaProduct } from "@/services/media/media-types";

export function fromApiMediaProduct(product: ApiMediaProduct) {
  return {
    ...product,
    images: resolveProductMediaPaths(product.images),
    primaryImage: resolveProductMediaPath(product.primaryImage),
  };
}
