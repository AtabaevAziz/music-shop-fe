"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { getDictionaries } from "@/services/config";
import { getEmployees } from "@/services/employees";

export function useEmployeesQuery() {
  return useQuery({
    queryKey: queryKeys.employeesPage,
    queryFn: async () => {
      const [employees, dictionaries] = await Promise.all([
        getEmployees(),
        getDictionaries(),
      ]);

      return {
        employees,
        dictionaries,
      };
    },
  });
}
