import type { ApiMediaProduct } from "@/services/media/media-types";

export function fromApiMediaProduct(product: ApiMediaProduct) {
  return {
    ...product,
    primaryImage: product.primaryImage || undefined,
  };
}
