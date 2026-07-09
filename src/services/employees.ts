import { api, unwrapEntityPayload, unwrapListPayload } from "@/lib/api-client";
import { fromApiEmployee } from "@/services/employees/employees-mapper";
import type {
  ApiEmployee,
  ApiEmployeeResponse,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
} from "@/services/employees/employees-types";

export async function getEmployees() {
  const response = await api.get<{ items: ApiEmployee[] } | ApiEmployee[]>(
    "employees",
  );
  return unwrapListPayload(response).map(fromApiEmployee);
}

export async function createEmployee(input: CreateEmployeeRequest) {
  const response = await api.post<ApiEmployeeResponse>("employees", input);
  return fromApiEmployee(response.employee);
}

export async function updateEmployee(id: string, input: UpdateEmployeeRequest) {
  const response = await api.put<ApiEmployee | ApiEmployeeResponse>(
    `employees/${id}`,
    input,
  );
  return fromApiEmployee(unwrapEntityPayload(response, "employee"));
}

export async function deleteEmployee(id: string) {
  await api.delete<void>(`employees/${id}`);
}
