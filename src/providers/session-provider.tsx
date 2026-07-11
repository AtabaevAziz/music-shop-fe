"use client";

import {
  createContext,
  useContext,
  useMemo,
} from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

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
  isAuthenticating: boolean;
  login: (login: string, password: string) => Promise<Session>;
  logout: () => Promise<void>;
  refetchSession: () => Promise<Session | null>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const sessionQuery = useQuery({
    queryKey: queryKeys.session,
    queryFn: getSession,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: ({ login, password }: { login: string; password: string }) =>
      loginRequest({ login, password }),
    onSuccess: async (session) => {
      queryClient.setQueryData(queryKeys.session, session);
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] !== "session",
      });
    },
  });

  const logoutMutation = useMutation({
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
      ready: !sessionQuery.isPending,
      session: sessionQuery.data ?? null,
      isAuthenticating:
        loginMutation.isPending ||
        logoutMutation.isPending ||
        sessionQuery.isFetching,
      login: async (login, password) =>
        loginMutation.mutateAsync({ login, password }),
      logout: async () => {
        await logoutMutation.mutateAsync();
      },
      refetchSession: async () => {
        const result = await sessionQuery.refetch();
        return result.data ?? null;
      },
    }),
    [
      loginMutation,
      logoutMutation,
      sessionQuery.data,
      sessionQuery.isFetching,
      sessionQuery.isPending,
      sessionQuery.refetch,
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
