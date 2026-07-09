import { api } from "@/lib/api-client";
import { fromApiSession } from "@/services/auth/auth-mapper";
import type {
  ApiLoginResponse,
  ApiSessionResponse,
  LoginRequest,
} from "@/services/auth/auth-types";

export async function login(input: LoginRequest) {
  const response = await api.post<ApiLoginResponse>("auth/login", input);
  return fromApiSession(response.session);
}

export async function getSession() {
  const response = await api.get<ApiSessionResponse>("auth/session");
  return fromApiSession(response.session);
}

export async function logout() {
  await api.post<void>("auth/logout");
}
