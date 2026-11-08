import type { NextConfig } from "next";

const apiOrigin = process.env.VOLTY_API_URL ?? "http://127.0.0.1:8000";
const staticExport = process.env.VOLTY_STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  ...(staticExport
    ? { output: "export" as const }
    : {
        experimental: {
          agentUpgrade: "security",
        },
        cacheComponents: true,
        partialPrefetching: true,
        async rewrites() {
          return [{ source: "/api/:path*", destination: `${apiOrigin}/api/:path*` }];
        },
      }),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
