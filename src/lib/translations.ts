type TranslationValues = Record<string, string | number | Date>;
type TranslateFn = (key: string, values?: TranslationValues) => string;

const entityTypeToNavKey: Record<string, string> = {
  categories: "categories",
  brands: "brands",
  customers: "customers",
  employees: "employees",
  products: "catalog",
};

export function dynamicLabel(t: TranslateFn, value: string) {
  return t(`dynamic.${value}`);
}

export function formatTranslatedMessage(
  t: TranslateFn,
  key: string,
  params: TranslationValues = {},
) {
  if (key === "activity.orderMoved") {
    return t(key, {
      ...params,
      status: dynamicLabel(t, String(params.status ?? "")),
    });
  }

  if (key === "activity.entityRemoved") {
    return t(key, {
      ...params,
      entityType: t(
        `nav.${entityTypeToNavKey[String(params.entityType ?? "")]}`,
      ),
    });
  }

  return t(key, params);
}
