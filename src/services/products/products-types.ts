import type { Product } from "@/types/music";

export type ProductsListQuery = {
  status?: Product["status"];
  categoryId?: string;
  brandId?: string;
  search?: string;
};

export type ApiProduct = Product;

export type CreateProductRequest = Omit<Product, "id">;

export type UpdateProductRequest = Omit<Product, "id">;

export type ApiProductResponse = {
  product: ApiProduct;
};
