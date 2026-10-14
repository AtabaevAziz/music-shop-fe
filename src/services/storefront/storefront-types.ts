import type { Condition } from "@/types/music";

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
  inStock: boolean;
  shortDescription: string;
  description: string;
  specs: Record<string, string>;
  images: string[];
  primaryImage?: string;
  condition: Condition;
  category: StorefrontCategory;
  brand: string;
  repairable: boolean;
  variants: StorefrontProductVariant[];
};

export type StorefrontProductVariant = {
  id: string;
  colorKey: string;
  colorName: string;
  sku: string;
  price: number;
  inStock: boolean;
  images: string[];
  primaryImage?: string;
};

export type ApiStorefrontProduct = {
  id: string;
  name: string;
  slug?: string;
  sku: string;
  price: number;
  inStock: boolean;
  shortDescription: string;
  description: string;
  specs: Record<string, string>;
  images: string[];
  primaryImage: string | null;
  condition: Condition;
  category: ApiStorefrontCategory;
  brand: string;
  repairable: boolean;
  variants: StorefrontProductVariant[];
};

export type ApiStorefrontProductListResponse = {
  items: ApiStorefrontProduct[];
};

export type ApiStorefrontProductResponse = {
  product: ApiStorefrontProduct;
};
