import { api, unwrapListPayload } from "@/lib/api-client";
import { fromApiInventoryMovement } from "@/services/inventory/inventory-mapper";
import type {
  AdjustInventoryRequest,
  ApiInventoryAdjustmentResponse,
  ApiInventoryMovement,
  InventoryMovementsQuery,
} from "@/services/inventory/inventory-types";

export async function getInventoryMovements(query: InventoryMovementsQuery = {}) {
  const response = await api.get<{ items: ApiInventoryMovement[] } | ApiInventoryMovement[]>(
    "inventory/movements",
    { params: query },
  );
  return unwrapListPayload(response).map(fromApiInventoryMovement);
}

export async function adjustInventoryStock(input: AdjustInventoryRequest) {
  return api.post<ApiInventoryAdjustmentResponse>("inventory/adjustments", input);
}
