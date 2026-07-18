import type { Product } from "@/types/music";

export type ProductsListQuery = {
  status?: Product["status"];
  categoryId?: string;
  brand?: string;
  search?: string;
};

export type ApiProduct = Omit<Product, "brand"> & {
  brand?: string | { name?: string | null } | null;
  brandId?: string | null;
};

export type CreateProductRequest = Omit<Product, "id">;

export type UpdateProductRequest = Omit<Product, "id">;

export type ApiProductResponse = {
  product: ApiProduct;
};
