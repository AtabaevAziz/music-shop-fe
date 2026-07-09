import type { Category } from "@/types/music";

export type ApiCategory = Category;

export type CreateCategoryRequest = Omit<Category, "id" | "slug">;

export type UpdateCategoryRequest = Omit<Category, "id" | "slug">;

export type ApiCategoryResponse = {
  category: ApiCategory;
};
