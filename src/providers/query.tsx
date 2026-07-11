"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactNode, useState } from "react";

import { ApiClientError } from "@/lib/api-error";

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error) => {
              if (error instanceof ApiClientError && error.status < 500) {
                return false;
              }
              return failureCount < 2;
            },
            retryDelay: 150,
            staleTime: 1000 * 30,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: false,
          },
        },
        queryCache: new QueryCache({
          onError: (error) => {
            console.error("Query error:", error);
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            console.error("Mutation error:", error);
          },
        }),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
