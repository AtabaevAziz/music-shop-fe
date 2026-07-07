"use client";

import { useSessionStore } from "@/store/music-store";

export function RoleRoute({
  client,
  staff,
}: {
  client: React.ReactNode;
  staff: React.ReactNode;
}) {
  const { session } = useSessionStore();

  return session?.role === "client" ? <>{client}</> : <>{staff}</>;
}
