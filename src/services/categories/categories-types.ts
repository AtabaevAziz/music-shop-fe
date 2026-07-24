import type { Category } from "@/types/music";

export type ApiCategory = Category;

export type CreateCategoryRequest = {
  name: string;
  parentId?: string;
  image: string;
  status: Category["status"];
  description: string;
};

export type UpdateCategoryRequest = Partial<CreateCategoryRequest>;

export type ApiCategoryResponse = {
  category: ApiCategory;
};
