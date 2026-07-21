import { z } from "zod";

function trimStringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : value;
}

function trimToUndefined(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

export function requiredTrimmedString(minLength: number) {
  return z.preprocess(trimStringValue, z.string().min(minLength));
}

export function optionalTrimmedString(minLength = 1) {
  return z.preprocess(trimToUndefined, z.string().min(minLength).optional());
}

export function requiredTrimmedEmail() {
  return z.preprocess(trimStringValue, z.string().email());
}

export function optionalTrimmedEmail() {
  return z.preprocess(trimToUndefined, z.string().email().optional());
}

export function optionalTrimmedUrl() {
  return z.preprocess(trimToUndefined, z.string().url().optional());
}

export function normalizeRequiredString(value: string) {
  return value.trim();
}

export function normalizeOptionalString(value: string | null | undefined) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}
