import type { ApiRepairRequest } from "@/services/repairs/repairs-types";
import type { RepairRequest } from "@/types/music";

export function fromApiRepairRequest(
  repairRequest: ApiRepairRequest,
): RepairRequest {
  return repairRequest;
}
