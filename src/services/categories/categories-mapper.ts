import type { ApiCategory } from "@/services/categories/categories-types";
import type { Category } from "@/types/music";

export function fromApiCategory(category: ApiCategory): Category {
  return {
    ...category,
    parentId: category.parentId || undefined,
  };
}
