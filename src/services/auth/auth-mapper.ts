import type { ApiSession } from "@/services/auth/auth-types";
import type { Session } from "@/types/music";

export function fromApiSession(session: ApiSession): Session;
export function fromApiSession(
  session: ApiSession | null | undefined,
): Session | null;
export function fromApiSession(
  session: ApiSession | null | undefined,
): Session | null {
  if (!session) {
    return null;
  }

  return {
    ...session,
    customerId: session.customerId || undefined,
  };
}
