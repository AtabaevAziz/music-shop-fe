import type { ApiInventoryMovement } from "@/services/inventory/inventory-types";
import type { InventoryMovement } from "@/types/music";

export function fromApiInventoryMovement(
  movement: ApiInventoryMovement,
): InventoryMovement {
  return movement;
}
