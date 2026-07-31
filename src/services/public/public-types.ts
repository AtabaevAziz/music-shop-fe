import type { Order, RepairRequest } from "@/types/music";

export type PublicOrderPaymentMethod = "cash" | "online";
export type PublicOrderDeliveryMethod =
  | "pickup"
  | "courier"
  | "delivery_company"
  | "post";

export type CreateOrderItemRequest = {
  productId: string;
  quantity: number;
};

export type CreatePublicOrderRequest = {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  country: string;
  region: string;
  city: string;
  street: string;
  house: string;
  apartment?: string;
  postalCode: string;
  paymentMethod: PublicOrderPaymentMethod;
  deliveryMethod: PublicOrderDeliveryMethod;
  deliveryCompany?: string;
  comment?: string;
  items: CreateOrderItemRequest[];
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

export type GetPublicOrderRequest = {
  orderNumber: string;
  phone?: string;
  email?: string;
};

export type ApiPublicOrderResponse = {
  order: ApiPublicOrder;
};

export type ApiPublicRepairResponse = {
  repairRequest: ApiPublicRepair;
};
