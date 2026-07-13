export const API_BASE_URL_ENV_VAR = "NEXT_PUBLIC_API_BASE_URL";
export const LEGACY_API_BASE_URL_ENV_VAR = "NEXT_PUBLIC_MUSIC_SHOP_BE_URL";
export const API_BASE_URL_EXAMPLE = "http://localhost:8080/api/v1";

export const missingApiBaseUrlMessage = `Missing ${API_BASE_URL_ENV_VAR}. Set it in .env.local to your backend base URL, for example ${API_BASE_URL_EXAMPLE}.`;

function readEnvValue(value: string | undefined) {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : null;
}

export function getConfiguredApiBaseUrl() {
  return (
    readEnvValue(process.env.NEXT_PUBLIC_API_BASE_URL) ??
    readEnvValue(process.env.NEXT_PUBLIC_MUSIC_SHOP_BE_URL)
  );
}

export function hasConfiguredApiBaseUrl() {
  return getConfiguredApiBaseUrl() !== null;
}
