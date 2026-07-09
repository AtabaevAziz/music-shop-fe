import type { InventoryMovement, Product } from "@/types/music";

export type InventoryMovementsQuery = {
  productId?: string;
  limit?: number;
};

export type ApiInventoryMovement = InventoryMovement;

export type AdjustInventoryRequest = {
  productId: string;
  delta: number;
  reason: string;
};

export type ApiInventoryAdjustmentResponse = {
  product: Pick<Product, "id" | "stockQty">;
  movement: ApiInventoryMovement;
};
