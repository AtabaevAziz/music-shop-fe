"use client";

import { ReactNode } from "react";

import { PageHeader } from "@/components/shared/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card className={cn("table-card border-border/60 bg-card/90", className)}>
      {title || subtitle || actions ? (
        <CardHeader className="space-y-0">
          <PageHeader
            title={title ?? ""}
            subtitle={subtitle ?? ""}
            actions={actions}
          />
        </CardHeader>
      ) : null}
      <CardContent className={cn((title || subtitle || actions) && "pt-0")}>
        {children}
      </CardContent>
    </Card>
  );
}

export function ModuleEmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card
      className={cn(
        "empty-state empty-state-detailed border-dashed bg-background/70 shadow-none",
        className,
      )}
    >
      <CardHeader className="items-center text-center">
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      {action ? (
        <CardContent className="flex justify-center pt-0">{action}</CardContent>
      ) : null}
    </Card>
  );
}
