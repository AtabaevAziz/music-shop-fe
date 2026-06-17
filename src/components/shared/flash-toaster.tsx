"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { formatTranslatedMessage } from "@/lib/translations";
import { useMusicStore } from "@/store/music-store";

export function FlashToaster() {
  const t = useTranslations();
  const { flash } = useMusicStore();
  const previousKey = useRef<string>("");

  useEffect(() => {
    if (!flash) {
      return;
    }

    const resolvedMessage =
      flash.message ??
      (flash.key ? formatTranslatedMessage(t, flash.key, flash.params) : "");
    const dedupeKey = `${flash.kind}:${resolvedMessage}:${flash.key ?? ""}`;

    if (!resolvedMessage || previousKey.current === dedupeKey) {
      return;
    }

    previousKey.current = dedupeKey;
    if (flash.kind === "error") {
      toast.error(resolvedMessage);
      return;
    }

    toast.success(resolvedMessage);
  }, [flash, t]);

  return null;
}
