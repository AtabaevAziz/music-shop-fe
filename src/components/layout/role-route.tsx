"use client";

import { useAuthSession } from "@/providers/session-provider";

export function RoleRoute({
  client,
  staff,
}: {
  client: React.ReactNode;
  staff: React.ReactNode;
}) {
  const { session } = useAuthSession();

  return session?.role === "client" ? <>{client}</> : <>{staff}</>;
}
