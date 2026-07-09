import type { Customer } from "@/types/music";

export type ApiCustomer = Customer;

export type CreateCustomerRequest = Omit<Customer, "id">;

export type UpdateCustomerRequest = Omit<Customer, "id">;

export type ApiCustomerResponse = {
  customer: ApiCustomer;
};
