"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { GenericCrudModule } from "@/features/shared/generic-crud";
import { useEmployeesQuery } from "@/hooks/use-employees-query";
import { invalidateAppQueries } from "@/lib/query-utils";
import { getDictionarySelectOptions } from "@/lib/runtime-config";
import { dynamicLabel } from "@/lib/translations";
import {
  createEmployee,
  deleteEmployee,
  updateEmployee,
} from "@/services/employees";
import { Employee, Role } from "@/types/music";

type EmployeeDraft = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  role: Employee["role"];
  status: Employee["status"];
};

export function EmployeesModule() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const { data, isPending } = useEmployeesQuery();
  const employees = data?.employees ?? [];
  const availableRoles = getDictionarySelectOptions(
    t,
    data?.dictionaries.roles?.filter((role) => role.value !== "client"),
    [
      "admin",
      "store_manager",
      "catalog_manager",
      "sales_operator",
    ] as const,
  );
  const saveMutation = useMutation({
    mutationFn: async (draft: EmployeeDraft) => {
      const payload = {
        name: draft.name,
        email: draft.email,
        phone: draft.phone,
        role: draft.role,
        status: draft.status,
      };

      if (draft.id) {
        await updateEmployee(draft.id, payload);
        return;
      }

      await createEmployee(payload);
    },
    onSuccess: async () => {
      await invalidateAppQueries(queryClient);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: async () => {
      await invalidateAppQueries(queryClient);
    },
  });

  if (isPending && !data) {
    return (
      <section className="table-card">
        <div className="empty-state">{t("common.loadingWorkspace")}</div>
      </section>
    );
  }

  return (
    <GenericCrudModule<Employee, EmployeeDraft>
      title={t("nav.employees")}
      subtitle={t("section.employeesSubtitle")}
      items={employees}
      createDraft={() => ({
        name: "",
        email: "",
        phone: "",
        role: (availableRoles[0]?.value as Employee["role"]) ?? "sales_operator",
        status: "active",
      })}
      validateDraft={(draft) =>
        draft.name.trim().length < 2 ||
        draft.phone.trim().length < 6 ||
        draft.email.trim().length < 5
          ? t("labels.validationFailed")
          : null
      }
      toDraft={(employee) => ({
        id: employee.id,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        role: employee.role,
        status: employee.status,
      })}
      getSearchText={(employee) =>
        `${employee.name} ${employee.email} ${employee.phone} ${employee.role}`.toLowerCase()
      }
      fields={[
        { name: "name", label: t("labels.name") },
        { name: "email", label: t("labels.email"), type: "email" },
        { name: "phone", label: t("labels.phone"), type: "tel" },
        {
          name: "role",
          label: t("labels.role"),
          type: "select",
          options: availableRoles,
        },
        {
          name: "status",
          label: t("common.status"),
          type: "select",
          options: [
            { label: dynamicLabel(t, "active"), value: "active" },
            { label: dynamicLabel(t, "inactive"), value: "inactive" },
          ],
        },
      ]}
      onSave={(draft) =>
        saveMutation.mutateAsync({
          id: draft.id,
          name: draft.name,
          email: draft.email,
          phone: draft.phone,
          role: draft.role as Role,
          status: draft.status,
        })
      }
      onDelete={(id) => deleteMutation.mutateAsync(id)}
    />
  );
}
