import type { Employee } from "@/types/music";

export type ApiEmployee = Employee;

export type CreateEmployeeRequest = Omit<Employee, "id">;

export type UpdateEmployeeRequest = Omit<Employee, "id">;

export type ApiEmployeeResponse = {
  employee: ApiEmployee;
};
