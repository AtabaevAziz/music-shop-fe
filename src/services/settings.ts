import { api } from "@/lib/api-client";
import { fromApiBusinessSettings } from "@/services/settings/settings-mapper";
import type {
  ApiBusinessSettingsResponse,
  UpdateBusinessSettingsRequest,
} from "@/services/settings/settings-types";

export async function getSettings() {
  const response = await api.get<ApiBusinessSettingsResponse>("settings");
  return fromApiBusinessSettings(response.settings);
}

export async function updateSettings(input: UpdateBusinessSettingsRequest) {
  const response = await api.put<ApiBusinessSettingsResponse>("settings", input);
  return fromApiBusinessSettings(response.settings);
}
