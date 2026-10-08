import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { resolve } from "path";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

const configuredImageHosts = (process.env.NEXT_PUBLIC_IMAGE_HOSTS ?? "")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      ...configuredImageHosts.flatMap((hostname) => [
        { protocol: "https" as const, hostname },
        ...(hostname === "localhost" || hostname === "127.0.0.1"
          ? [{ protocol: "http" as const, hostname }]
          : []),
      ]),
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": resolve(__dirname, "src"),
    };
    return config;
  },
};

export default withNextIntl(nextConfig);
