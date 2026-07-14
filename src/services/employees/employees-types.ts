import type { Employee } from "@/types/music";

export type ApiEmployee = Employee;

export type CreateEmployeeRequest = Pick<
  Employee,
  "name" | "email" | "phone" | "status"
> & {
  role?: Employee["role"];
};

export type UpdateEmployeeRequest = Partial<CreateEmployeeRequest>;

export type ApiEmployeeResponse = {
  employee: ApiEmployee;
};
