const REMOTE_MEDIA_PATTERN = /^(?:https?:)?\/\//i;
const INLINE_MEDIA_PATTERN = /^(?:data|blob):/i;

const CATEGORY_ASSET_PATHS: Record<string, string> = {
  "acoustic-guitar": "/assets/acoustic-guitar.png",
  "acoustic-guitars": "/assets/acoustic-guitar.png",
  "classical-guitar": "/assets/acoustic-guitar.png",
  "classical-guitars": "/assets/acoustic-guitar.png",
  cello: "/assets/cello.png",
  cellos: "/assets/cello.png",
  dombra: "/assets/dombra.png",
  dombras: "/assets/dombra.png",
  "drum-kit": "/assets/drum-kit.png",
  "drum-kits": "/assets/drum-kit.png",
  drums: "/assets/drum-kit.png",
  "electric-guitar": "/assets/electric-guitar.png",
  "electric-guitars": "/assets/electric-guitar.png",
  flute: "/assets/flute.png",
  flutes: "/assets/flute.png",
  guitar: "/assets/acoustic-guitar.png",
  guitars: "/assets/acoustic-guitar.png",
  microphone: "/assets/shure-sm7b.jpg",
  microphones: "/assets/shure-sm7b.jpg",
  keyboard: "/assets/grand-piano.png",
  keyboards: "/assets/grand-piano.png",
  "grand-piano": "/assets/grand-piano.png",
  piano: "/assets/grand-piano.png",
  pianos: "/assets/grand-piano.png",
  strings: "/assets/grand-piano.png",
  saxophone: "/assets/saxophone.png",
  saxophones: "/assets/saxophone.png",
  trumpet: "/assets/trumpet.png",
  trumpets: "/assets/trumpet.png",
  violin: "/assets/violin.png",
  violins: "/assets/violin.png",
};

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

export function resolveProductMediaPath(path?: string | null) {
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
    const resolvedPath = resolveProductMediaPath(path);
    return resolvedPath ? [resolvedPath] : [];
  });
}

export function resolveCategoryAssetPath(slug?: string | null) {
  const normalizedSlug = slug?.trim().toLowerCase();

  if (!normalizedSlug) {
    return undefined;
  }

  return CATEGORY_ASSET_PATHS[normalizedSlug];
}
