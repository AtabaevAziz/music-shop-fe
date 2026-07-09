import type { ApiBrand } from "@/services/brands/brands-types";
import type { Brand } from "@/types/music";

export function fromApiBrand(brand: ApiBrand): Brand {
  return {
    ...brand,
    website: brand.website.trim(),
  };
}
