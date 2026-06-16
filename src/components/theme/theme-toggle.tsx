"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle({
  variant = "navbar",
}: {
  variant?: "navbar" | "hero";
}) {
  const t = useTranslations();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const label = isDark ? t("common.switchToLight") : t("common.switchToDark");

  return (
    <button
      className={`button-ghost theme-toggle theme-toggle-${variant}`}
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={label}
      title={label}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
