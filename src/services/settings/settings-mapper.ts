import type { ApiBusinessSettings } from "@/services/settings/settings-types";
import type { BusinessSettings } from "@/types/music";

export function fromApiBusinessSettings(
  settings: ApiBusinessSettings,
): BusinessSettings {
  return settings;
}
