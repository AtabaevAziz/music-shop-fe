"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { getDictionaries } from "@/services/config";
import { getSettings } from "@/services/settings";

export function useSettingsQuery() {
  return useQuery({
    queryKey: queryKeys.settingsPage,
    queryFn: async () => {
      const [settings, dictionaries] = await Promise.all([
        getSettings(),
        getDictionaries(),
      ]);

      return {
        settings,
        dictionaries,
      };
    },
  });
}
