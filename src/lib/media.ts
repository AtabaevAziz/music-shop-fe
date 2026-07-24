const REMOTE_MEDIA_PATTERN = /^(?:https?:)?\/\//i;
const INLINE_MEDIA_PATTERN = /^(?:data|blob):/i;

function normalizeLocalMediaPath(path: string) {
  const normalizedPath = path.replace(/^\/+/, "");

  if (normalizedPath.startsWith("public/products/")) {
    return `/assets/${normalizedPath.slice("public/products/".length)}`;
  }

  if (normalizedPath.startsWith("products/")) {
    return `/assets/${normalizedPath.slice("products/".length)}`;
  }

  if (normalizedPath.startsWith("public/assets/")) {
    return `/${normalizedPath.slice("public/".length)}`;
  }

  if (normalizedPath.startsWith("assets/")) {
    return `/${normalizedPath}`;
  }

  if (normalizedPath.includes("/")) {
    return `/${normalizedPath}`;
  }

  return `/assets/${normalizedPath}`;
}

export function resolveMediaPath(path?: string | null) {
  const trimmedPath = path?.trim();

  if (!trimmedPath) {
    return undefined;
  }

  if (
    REMOTE_MEDIA_PATTERN.test(trimmedPath) ||
    INLINE_MEDIA_PATTERN.test(trimmedPath)
  ) {
    return trimmedPath;
  }

  return normalizeLocalMediaPath(trimmedPath);
}

export function resolveProductMediaPaths(
  paths: Array<string | null | undefined> = [],
) {
  return paths.flatMap((path) => {
    const resolvedPath = resolveMediaPath(path);
    return resolvedPath ? [resolvedPath] : [];
  });
}

export function resolveProductMediaPath(path?: string | null) {
  return resolveMediaPath(path);
}
