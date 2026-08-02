import type { RepairRequest, RepairStatus } from "@/types/music";

export type RepairsListQuery = {
  status?: RepairStatus;
  customerId?: string;
  limit?: number;
};

export type ApiRepairRequest = RepairRequest;

export type CreateRepairRequest = {
  customerId: string;
  instrumentName: string;
  brand: string;
  issue: string;
  notes: string;
  photoUrl?: string;
  status?: RepairStatus;
  estimatedCost?: number;
  assignedMasterName?: string;
  receivedAt?: string;
};

export type UpdateRepairRequest = CreateRepairRequest;

export type ApiRepairResponse = {
  repairRequest: ApiRepairRequest;
};
