"use client";

import { ApiClientError } from "@/lib/api-error";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  cache?: RequestCache;
  responseType?: "json" | "text" | "blob";
  signal?: AbortSignal;
  credentials?: RequestCredentials;
};

function normalizeBaseUrl(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function joinUrlPaths(...parts: Array<string | undefined>) {
  return parts
    .flatMap((part) => part?.split("/"))
    .filter(Boolean)
    .join("/")
    .replace(/\/+/g, "/")
    .replace(":/", "://");
}

function buildUrlWithParams(
  url: string,
  params?: RequestOptions["params"],
): string {
  if (!params) {
    return url;
  }

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `${url}?${queryString}` : url;
}

function getApiUrl() {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_MUSIC_SHOP_BE_URL;

  if (!apiUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_API_BASE_URL. Set it to your backend base URL, for example http://localhost:8080/api/v1.",
    );
  }

  return normalizeBaseUrl(apiUrl);
}

function getLocaleHeader() {
  if (typeof document === "undefined") {
    return "ru-RU";
  }

  const localeCookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith("NEXT_LOCALE="))
    ?.split("=")[1];

  const locale = localeCookie ?? "ru";
  if (locale === "uz") {
    return "uz-UZ";
  }
  if (locale === "en") {
    return "en-US";
  }
  return "ru-RU";
}

async function parseResponse<T>(
  response: Response,
  responseType: NonNullable<RequestOptions["responseType"]>,
) {
  if (response.status === 204) {
    return undefined as T;
  }

  if (responseType === "blob") {
    return (await response.blob()) as T;
  }

  if (responseType === "text") {
    return (await response.text()) as T;
  }

  const contentType = response.headers.get("Content-Type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
}

async function fetchApi<T>(
  url: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    headers = {},
    body,
    params,
    cache = "no-store",
    responseType = "json",
    signal,
    credentials = "include",
  } = options;

  const fullUrl = buildUrlWithParams(
    `${getApiUrl()}/${joinUrlPaths(url)}`,
    params,
  );
  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept-Language", getLocaleHeader());

  if (body !== undefined && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(fullUrl, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache,
    signal,
    credentials,
  });

  if (!response.ok) {
    let errorPayload: unknown;
    try {
      errorPayload = await response.json();
    } catch {
      errorPayload = await response.text();
    }

    const apiError = errorPayload as
      | {
          error?: {
            code?: string;
            message?: string;
            field?: string;
          };
        }
      | undefined;

    throw new ApiClientError({
      status: response.status,
      message:
        apiError?.error?.message ??
        (typeof errorPayload === "string" && errorPayload) ??
        `Request failed with status ${response.status}.`,
      code: apiError?.error?.code,
      field: apiError?.error?.field,
      payload: errorPayload,
    });
  }

  return parseResponse<T>(response, responseType);
}

export const api = {
  get<T>(url: string, options?: Omit<RequestOptions, "method" | "body">) {
    return fetchApi<T>(url, { ...options, method: "GET" });
  },
  post<T>(
    url: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) {
    return fetchApi<T>(url, { ...options, method: "POST", body });
  },
  put<T>(
    url: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) {
    return fetchApi<T>(url, { ...options, method: "PUT", body });
  },
  patch<T>(
    url: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) {
    return fetchApi<T>(url, { ...options, method: "PATCH", body });
  },
  delete<T>(url: string, options?: Omit<RequestOptions, "method" | "body">) {
    return fetchApi<T>(url, { ...options, method: "DELETE" });
  },
};

export function unwrapListPayload<T>(payload: { items: T[] } | T[]) {
  return Array.isArray(payload) ? payload : payload.items;
}

export function unwrapEntityPayload<T, TKey extends string>(
  payload: T | Record<TKey, T>,
  key: TKey,
) {
  if (payload && typeof payload === "object" && key in payload) {
    return (payload as Record<TKey, T>)[key];
  }

  return payload as T;
}
