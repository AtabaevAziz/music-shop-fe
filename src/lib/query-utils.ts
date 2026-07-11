import type { QueryClient } from "@tanstack/react-query";

export async function invalidateAppQueries(queryClient: QueryClient) {
  await queryClient.invalidateQueries({
    predicate: (query) => query.queryKey[0] !== "session",
  });
}
