"use client";

import { useTranslations } from "next-intl";

import { GenericCrudModule } from "@/features/shared/generic-crud";
import { dynamicLabel } from "@/lib/translations";
import { useEmployeeStore } from "@/store/music-store";
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
  const { employees, saveEmployee, deleteEntity } = useEmployeeStore();

  return (
    <GenericCrudModule<Employee, EmployeeDraft>
      title={t("nav.employees")}
      subtitle={t("section.employeesSubtitle")}
      items={employees}
      createDraft={() => ({
        name: "",
        email: "",
        phone: "",
        role: "sales_operator",
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
          options: (
            [
              "admin",
              "store_manager",
              "catalog_manager",
              "sales_operator",
            ] as Role[]
          ).map((role) => ({
            label: dynamicLabel(t, role),
            value: role,
          })),
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
        saveEmployee({
          id: draft.id,
          name: draft.name,
          email: draft.email,
          phone: draft.phone,
          role: draft.role as Role,
          status: draft.status,
        })
      }
      onDelete={(id) => deleteEntity("employees", id)}
    />
  );
}
