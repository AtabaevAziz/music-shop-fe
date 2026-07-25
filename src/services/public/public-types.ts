import type { Order, OrderItem, RepairRequest } from "@/types/music";

export type PublicOrderPaymentMethod = "cash" | "card" | "transfer";

export type CreatePublicOrderRequest = {
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  paymentMethod: PublicOrderPaymentMethod;
  comment?: string;
  items: OrderItem[];
};

export type CreatePublicRepairRequest = {
  customerName: string;
  phone: string;
  email?: string;
  instrumentType: string;
  instrumentModel: string;
  issueDescription: string;
  photoUrl?: string;
};

export type ApiPublicOrder = Order;
export type ApiPublicRepair = RepairRequest;

export type ApiPublicOrderResponse = {
  order: ApiPublicOrder;
};

export type ApiPublicRepairResponse = {
  repairRequest: ApiPublicRepair;
};
