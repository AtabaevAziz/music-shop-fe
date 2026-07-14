"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { getEmployees } from "@/services/employees";

export function useEmployeesQuery() {
  return useQuery({
    queryKey: queryKeys.employeesPage,
    queryFn: getEmployees,
  });
}
