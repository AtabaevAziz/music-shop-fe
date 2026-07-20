import type { Customer } from "@/types/music";

export type ApiCustomer = Customer;

export type CreateCustomerRequest = {
  name: string;
  fullName?: string;
  phone: string;
  email: string;
  tier: Customer["tier"];
  status: Customer["status"];
  notes: string;
};

export type UpdateCustomerRequest = Partial<CreateCustomerRequest>;

export type ApiCustomerResponse = {
  customer: ApiCustomer;
};
