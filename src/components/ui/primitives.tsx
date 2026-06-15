"use client";

import { ReactNode, useEffect } from "react";

import { Locale } from "@/i18n";
import { formatMoney } from "@/lib/utils";

export function Badge({
  tone,
  children,
}: {
  tone: "neutral" | "success" | "warn" | "danger";
  children: ReactNode;
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
}) {
  return (
    <div className="toolbar">
      <div className="toolbar-copy">
        <h2>{title}</h2>
        <p className="muted">{subtitle}</p>
      </div>
      {actions}
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function Money({
  value,
  currency,
  locale,
}: {
  value: number;
  currency: string;
  locale: Locale;
}) {
  return <>{formatMoney(value, currency, locale)}</>;
}

export function Modal({
  title,
  subtitle,
  children,
  onClose,
  closeLabel = "Close",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
  closeLabel?: string;
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeydown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <PageHeader
          title={title}
          subtitle={subtitle ?? ""}
          actions={
            <button
              className="button-ghost"
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
            >
              {closeLabel}
            </button>
          }
        />
        {children}
      </div>
    </div>
  );
}
