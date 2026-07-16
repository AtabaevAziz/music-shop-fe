import type { Locale } from "@/i18n";
import type {
  ApiNavigationItem,
  ApiPermissionMatrix,
} from "@/services/config/config-types";
import type { Role } from "@/types/music";

export function resolveNavigationHref(path: string, locale: Locale) {
  return path.replace("/:locale", `/${locale}`);
}

export function getRouteIdFromPathname(pathname: string) {
  const [, , firstSegment = "", secondSegment = ""] = pathname.split("/");

  if (firstSegment === "app") {
    return secondSegment || "dashboard";
  }

  return firstSegment || "dashboard";
}

export function canAccessRoute(
  role: Role | undefined,
  routeId: string,
  permissions: ApiPermissionMatrix | undefined,
) {
  if (!role) {
    return false;
  }

  return permissions?.[role]?.includes(routeId) ?? false;
}

export function getVisibleNavigationItems(
  items: ApiNavigationItem[] | undefined,
  locale: Locale,
  role: Role | undefined,
  permissions: ApiPermissionMatrix | undefined,
) {
  if (!items?.length || !role) {
    return [];
  }

  return items
    .filter(
      (item) =>
        item.roles.includes(role) && canAccessRoute(role, item.id, permissions),
    )
    .map((item) => ({
      ...item,
      href: resolveNavigationHref(item.path, locale),
    }));
}
