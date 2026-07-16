import type { Condition } from "@/types/music";

export type StorefrontCategory = {
  id: string;
  name: string;
  slug: string;
};

export type StorefrontBrand = {
  id: string;
  name: string;
  country: string;
  website: string;
};

export type StorefrontProduct = {
  id: string;
  name: string;
  sku: string;
  price: number;
  stockQty: number;
  shortDescription: string;
  description: string;
  specs: Record<string, string>;
  images: string[];
  primaryImage?: string;
  condition: Condition;
  category: StorefrontCategory;
  brand: StorefrontBrand;
};

export type ApiStorefrontProduct = {
  id: string;
  name: string;
  sku: string;
  price: number;
  stockQty: number;
  shortDescription: string;
  description: string;
  specs: Record<string, string>;
  images: string[];
  primaryImage: string | null;
  condition: Condition;
  category: StorefrontCategory;
  brand: StorefrontBrand;
};

export type ApiStorefrontProductListResponse = {
  items: ApiStorefrontProduct[];
};

export type ApiStorefrontProductResponse = {
  product: ApiStorefrontProduct;
};
