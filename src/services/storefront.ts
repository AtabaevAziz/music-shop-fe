import { api } from "@/lib/api-client";
import { fromApiStorefrontProduct } from "@/services/storefront/storefront-mapper";
import type {
  ApiStorefrontProductListResponse,
  ApiStorefrontProductResponse,
} from "@/services/storefront/storefront-types";

export async function getStorefrontProducts(search?: string) {
  const response = await api.get<ApiStorefrontProductListResponse>(
    "public/products",
    {
      params: search ? { search } : undefined,
    },
  );

  return response.items.map(fromApiStorefrontProduct);
}

export async function getStorefrontProduct(id: string) {
  const response = await api.get<ApiStorefrontProductResponse>(
    `public/products/${id}`,
  );
  return fromApiStorefrontProduct(response.product);
}
