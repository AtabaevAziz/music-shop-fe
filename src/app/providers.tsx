"use client";

import { ReactNode } from "react";

import { RuntimeConfigBootstrap } from "@/components/layout/runtime-config-bootstrap";
import { ThemeProvider } from "@/components/theme/theme-provider";
import QueryProvider from "@/providers/query";
import { SessionProvider } from "@/providers/session-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <RuntimeConfigBootstrap />
        <SessionProvider>{children}</SessionProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
