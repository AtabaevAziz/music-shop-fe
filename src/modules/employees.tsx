"use client";

import { GenericCrudModule } from "@/modules/generic-crud";
import { useMusicStore } from "@/data/store";
import { Locale } from "@/lib/i18n";
import { Role } from "@/data/types";

export function EmployeesModule({ locale }: { locale: Locale }) {
  const { db, saveEmployee, deleteEntity } = useMusicStore();

  return (
    <GenericCrudModule
      locale={locale}
      title="Employees"
      subtitle="Role-aware internal users for protected backoffice access."
      items={db.employees}
      fields={[
        { name: "name", label: "Name" },
        { name: "email", label: "Email" },
        { name: "phone", label: "Phone" },
        {
          name: "role",
          label: "Role",
          type: "select",
          options: (
            [
              "admin",
              "store_manager",
              "catalog_manager",
              "sales_operator",
            ] as Role[]
          ).map((role) => ({ label: role, value: role })),
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "active", value: "active" },
            { label: "inactive", value: "inactive" },
          ],
        },
      ]}
      onSave={(draft) =>
        saveEmployee({
          id: draft.id,
          name: draft.name ?? "",
          email: draft.email ?? "",
          phone: draft.phone ?? "",
          role: (draft.role as Role) ?? "sales_operator",
          status: (draft.status as "active" | "inactive") ?? "active",
        })
      }
      onDelete={(id) => deleteEntity("employees", id)}
    />
  );
}
