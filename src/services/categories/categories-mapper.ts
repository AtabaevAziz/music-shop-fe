import { resolveMediaPath } from "@/lib/media";
import type { ApiCategory } from "@/services/categories/categories-types";
import type { Category } from "@/types/music";

export function fromApiCategory(category: ApiCategory): Category {
  return {
    ...category,
    image: resolveMediaPath(category.image) ?? "",
    parentId: category.parentId || undefined,
  };
}
