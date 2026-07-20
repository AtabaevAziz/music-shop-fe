import type { Product } from "@/types/music";

export type ProductsListQuery = {
  status?: Product["status"];
  categoryId?: string;
  brand?: string;
  search?: string;
};

export type ApiProduct = Product;

export type CreateProductRequest = {
  name: string;
  sku: string;
  barcode?: string;
  categoryId: string;
  brand: string;
  price: number;
  costPrice: number;
  stockQty: number;
  minStockQty?: number;
  status: Product["status"];
  shortDescription: string;
  description: string;
  specs: Product["specs"];
  images: string[];
  primaryImage?: string;
  condition: Product["condition"];
};

export type UpdateProductRequest = Partial<CreateProductRequest>;

export type ApiProductResponse = {
  product: ApiProduct;
};
