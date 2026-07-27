import type { Session } from "@/types/music";

export type LoginRequest = {
  login: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  phone: string;
  email: string;
  password: string;
};

export type ApiSession = Session;

export type ApiLoginResponse = {
  session: ApiSession;
};

export type ApiRegisterResponse = {
  session: ApiSession;
};

export type ApiSessionResponse = {
  session: ApiSession | null;
};
