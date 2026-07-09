import type { ApiCustomer } from "@/services/customers/customers-types";
import type { Customer } from "@/types/music";

export function fromApiCustomer(customer: ApiCustomer): Customer {
  return customer;
}
