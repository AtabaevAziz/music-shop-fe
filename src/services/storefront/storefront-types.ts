import type { Condition, ProductVariant } from "@/types/music";

export type StorefrontCategory = {
  id: string;
  name: string;
  slug: string;
  image?: string;
};

export type ApiStorefrontCategory = {
  id: string;
  name: string;
  slug: string;
  image: string;
};

export type StorefrontProduct = {
  id: string;
  name: string;
  slug?: string;
  sku: string;
  price: number;
  stockQty: number;
  reservedQty: number;
  availableQty: number;
  shortDescription: string;
  description: string;
  specs: Record<string, string>;
  images: string[];
  primaryImage?: string;
  condition: Condition;
  category: StorefrontCategory;
  brand: string;
  variants: ProductVariant[];
};

export type ApiStorefrontProduct = {
  id: string;
  name: string;
  slug?: string;
  sku: string;
  price: number;
  stockQty: number;
  reservedQty: number;
  availableQty: number;
  shortDescription: string;
  description: string;
  specs: Record<string, string>;
  images: string[];
  primaryImage: string | null;
  condition: Condition;
  category: ApiStorefrontCategory;
  brand: string;
  variants: ProductVariant[];
};

export type ApiStorefrontProductListResponse = {
  items: ApiStorefrontProduct[];
};

export type ApiStorefrontProductResponse = {
  product: ApiStorefrontProduct;
};
