"use client";

import { GenericCrudModule } from "@/features/shared/generic-crud";
import { Locale, getDictionary, translateDynamicLabel } from "@/lib/i18n";
import { useMusicStore } from "@/store/music-store";
import { Employee, Role } from "@/types/music";

type EmployeeDraft = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  role: Employee["role"];
  status: Employee["status"];
};

export function EmployeesModule({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { db, saveEmployee, deleteEntity } = useMusicStore();

  return (
    <GenericCrudModule<Employee, EmployeeDraft>
      locale={locale}
      title={dict.employees}
      subtitle={dict.employeesSubtitle}
      items={db.employees}
      createDraft={() => ({
        name: "",
        email: "",
        phone: "",
        role: "sales_operator",
        status: "active",
      })}
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
        { name: "name", label: dict.nameLabel },
        { name: "email", label: dict.emailLabel, type: "email" },
        { name: "phone", label: dict.phoneLabel, type: "tel" },
        {
          name: "role",
          label: dict.roleLabel,
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
