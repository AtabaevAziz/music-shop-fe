"use client";

import { ReactNode } from "react";

import { ThemeProvider } from "@/components/theme/theme-provider";
import QueryProvider from "@/providers/query";
import { SessionProvider } from "@/providers/session-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <SessionProvider>{children}</SessionProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
