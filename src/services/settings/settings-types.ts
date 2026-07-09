import type { BusinessSettings } from "@/types/music";

export type ApiBusinessSettings = BusinessSettings;

export type UpdateBusinessSettingsRequest = BusinessSettings;

export type ApiBusinessSettingsResponse = {
  settings: ApiBusinessSettings;
};
