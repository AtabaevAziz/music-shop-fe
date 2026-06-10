"use client";

import { ReactNode } from "react";
import { formatMoney } from "@/lib/utils";
import { Locale } from "@/lib/i18n";

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
      <div>
        <h2 style={{ margin: 0 }}>{title}</h2>
        <p className="muted" style={{ marginBottom: 0 }}>
          {subtitle}
        </p>
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
