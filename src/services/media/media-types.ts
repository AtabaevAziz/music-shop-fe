import type { Product } from "@/types/music";

export type AttachProductImageRequest = {
  image: string;
};

export type SetPrimaryImageRequest = {
  image: string;
};

export type ApiMediaProduct = Pick<Product, "id" | "images" | "primaryImage">;

export type ApiMediaProductResponse = {
  product: ApiMediaProduct;
};
