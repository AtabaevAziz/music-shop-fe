import { isLocale } from "@/i18n";

const sessionAwareRouteRoots = new Set(["app", "login"]);

export function shouldLoadSessionForPathname(pathname: string): boolean {
  const [pathWithoutQuery] = pathname.split("?");
  const segments = pathWithoutQuery.split("/").filter(Boolean);

  if (segments.length < 2) {
    return false;
  }

  const [locale, routeRoot] = segments;
  return isLocale(locale) && sessionAwareRouteRoots.has(routeRoot);
}
