"use client";

import { ReactNode } from "react";

import { PageHeader } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

type ModuleSectionProps = {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function ModuleSection({
  title,
  subtitle,
  actions,
  children,
  className,
}: ModuleSectionProps) {
  return (
    <section className={cn("table-card", className)}>
      {title || subtitle || actions ? (
        <PageHeader title={title ?? ""} subtitle={subtitle ?? ""} actions={actions} />
      ) : null}
      {children}
    </section>
  );
}

export function ModuleEmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("empty-state empty-state-detailed", className)}>
      <strong>{title}</strong>
      {description ? <p>{description}</p> : null}
      {action ? <div className="stack-row form-actions">{action}</div> : null}
    </div>
  );
}
