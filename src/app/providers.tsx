"use client";

import { ReactNode } from "react";

import { ThemeProvider } from "@/components/theme/theme-provider";
import QueryProvider from "@/providers/query";
import { RuntimeConfigBootstrap } from "@/providers/runtime-config-bootstrap";
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
