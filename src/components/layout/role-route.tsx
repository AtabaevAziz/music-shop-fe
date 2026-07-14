"use client";

import { useAuthSession } from "@/providers/session-provider";

export function RoleRoute({
  client,
  admin,
}: {
  client: React.ReactNode;
  admin: React.ReactNode;
}) {
  const { session } = useAuthSession();

  return session?.role === "client" ? <>{client}</> : <>{admin}</>;
}
