import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Skip expensive lint/type checks during CI/build to reduce memory footprint.
  // Revert these temporarily if you want strict build-time checks later.
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow building even if there are type errors. Use only as a temporary measure.
    ignoreBuildErrors: true,
  },
  webpack: (config: any) => {
    if (process.env.NODE_ENV === "development") {
      config.module.rules.push({
        test: /\.(jsx|tsx)$/,
        exclude: /node_modules/,
        enforce: "pre",
        use: "@dyad-sh/nextjs-webpack-component-tagger",
      });
    }
    return config;
  },
  // Prevent Next.js from inferring a workspace root outside this project
  // (silences the "inferred your workspace root" warning when other
  // lockfiles exist in parent folders).
  outputFileTracingRoot: path.join(__dirname),
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;