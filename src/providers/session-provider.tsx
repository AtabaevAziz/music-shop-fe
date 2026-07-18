"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { createContext, useContext, useMemo } from "react";

import { hasConfiguredApiBaseUrl } from "@/lib/api-config";
import { queryKeys } from "@/lib/query-keys";
import {
  login as loginRequest,
  logout as logoutRequest,
} from "@/services/auth";
import { getSession } from "@/services/auth";
import type { Session } from "@/types/music";

type SessionContextValue = {
  ready: boolean;
  session: Session | null;
  sessionError: Error | null;
  isAuthenticating: boolean;
  login: (login: string, password: string) => Promise<Session>;
  logout: () => Promise<void>;
  refetchSession: () => Promise<Session | null>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const isApiConfigured = hasConfiguredApiBaseUrl();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const shouldLoadSession =
    isApiConfigured && /^\/[^/]+\/app(?:\/|$)/.test(pathname);
  const {
    data: session,
    error: sessionError,
    isFetching: isSessionFetching,
    isPending: isSessionPending,
    refetch: refetchSession,
  } = useQuery({
    enabled: shouldLoadSession,
    queryKey: queryKeys.session,
    queryFn: getSession,
    retry: false,
  });

  const { isPending: isLoginPending, mutateAsync: login } = useMutation({
    mutationFn: ({ login, password }: { login: string; password: string }) =>
      loginRequest({ login, password }),
    onSuccess: async (session) => {
      queryClient.setQueryData(queryKeys.session, session);
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] !== "session",
      });
    },
  });

  const { isPending: isLogoutPending, mutateAsync: logout } = useMutation({
    mutationFn: logoutRequest,
    onSettled: async () => {
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== "session",
      });
      queryClient.setQueryData(queryKeys.session, null);
    },
  });

  const value = useMemo<SessionContextValue>(
    () => ({
      ready: !shouldLoadSession || !isSessionPending,
      session: session ?? null,
      sessionError:
        shouldLoadSession && sessionError instanceof Error ? sessionError : null,
      isAuthenticating: isLoginPending || isLogoutPending || isSessionFetching,
      login: async (loginValue, password) =>
        login({ login: loginValue, password }),
      logout: async () => {
        await logout();
      },
      refetchSession: async () => {
        if (!shouldLoadSession) {
          return null;
        }

        const result = await refetchSession();
        return result.data ?? null;
      },
    }),
    [
      isLoginPending,
      isLogoutPending,
      isSessionFetching,
      isSessionPending,
      login,
      logout,
      shouldLoadSession,
      refetchSession,
      session,
      sessionError,
    ],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useAuthSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useAuthSession must be used within SessionProvider");
  }

  return context;
}
