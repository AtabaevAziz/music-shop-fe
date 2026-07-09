"use client";

import { ReactNode } from "react";

import { ThemeProvider } from "@/components/theme/theme-provider";
import QueryProvider from "@/providers/query";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>{children}</QueryProvider>
    </ThemeProvider>
  );
}
