"use client";

import { GenericCrudModule } from "@/features/shared/generic-crud";
import { useMusicStore } from "@/store/music-store";
import { getDictionary, Locale, translateDynamicLabel } from "@/lib/i18n";
import { Role } from "@/types/music";

export function EmployeesModule({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { db, saveEmployee, deleteEntity } = useMusicStore();

  return (
    <GenericCrudModule
      locale={locale}
      title={dict.employees}
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
          ).map((role) => ({
            label: translateDynamicLabel(locale, role),
            value: role,
          })),
        },
        {
          name: "status",
          label: dict.status,
          type: "select",
          options: [
            { label: translateDynamicLabel(locale, "active"), value: "active" },
            {
              label: translateDynamicLabel(locale, "inactive"),
              value: "inactive",
            },
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
