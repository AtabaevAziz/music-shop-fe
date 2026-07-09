import type { ApiEmployee } from "@/services/employees/employees-types";
import type { Employee } from "@/types/music";

export function fromApiEmployee(employee: ApiEmployee): Employee {
  return employee;
}
