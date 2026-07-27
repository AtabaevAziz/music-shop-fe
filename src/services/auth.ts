import { api } from "@/lib/api-client";
import { fromApiSession } from "@/services/auth/auth-mapper";
import type {
  ApiRegisterResponse,
  ApiLoginResponse,
  ApiSessionResponse,
  LoginRequest,
  RegisterRequest,
} from "@/services/auth/auth-types";

export async function login(input: LoginRequest) {
  const response = await api.post<ApiLoginResponse>("auth/login", input);
  return fromApiSession(response.session);
}

export async function register(input: RegisterRequest) {
  const response = await api.post<ApiRegisterResponse>("auth/register", input);
  return fromApiSession(response.session);
}

export async function getSession() {
  const response = await api.get<ApiSessionResponse>("auth/session");
  return fromApiSession(response.session);
}

export async function logout() {
  await api.post<void>("auth/logout");
}
