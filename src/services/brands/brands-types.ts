import type { Brand } from "@/types/music";

export type ApiBrand = Brand;

export type CreateBrandRequest = Omit<Brand, "id">;

export type UpdateBrandRequest = Omit<Brand, "id">;

export type ApiBrandResponse = {
  brand: ApiBrand;
};
