import type { Session } from "@/types/music";

export type LoginRequest = {
  login: string;
  password: string;
};

export type ApiSession = Session;

export type ApiLoginResponse = {
  session: ApiSession;
};

export type ApiSessionResponse = {
  session: ApiSession | null;
};
