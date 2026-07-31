import type {
  Customer,
  Order,
  Product,
  RepairRequest,
} from "@/types/music";

export type ApiClientCustomer = Customer;

export type ApiClientProduct = Product;

export type ApiClientOrder = Order;

export type ApiClientRepairRequest = RepairRequest;

export type ApiClientMeResponse = {
  customer: ApiClientCustomer | null;
};

export type CreateClientOrderItemRequest = {
  productId: string;
  quantity: number;
};

export type CreateClientOrderRequest = {
  items: CreateClientOrderItemRequest[];
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
  paymentMethod: "cash" | "online";
  deliveryMethod: "pickup" | "courier" | "delivery_company" | "post";
  deliveryCompany?: string;
  comment?: string;
};

export type CreateClientRepairRequest = {
  instrumentName: string;
  brand: string;
  issue: string;
  notes: string;
};

export type ApiClientOrderResponse = {
  order: ApiClientOrder;
};

export type ApiClientRepairResponse = {
  repairRequest: ApiClientRepairRequest;
};
