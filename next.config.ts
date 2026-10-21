import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  cacheComponents: true,
  logging: {
    // Server Function arguments include credentials in the onboarding flow.
    serverFunctions: false,
  },
  async headers() {
    return [{
      source: '/onboarding',
      headers: [
        { key: 'Referrer-Policy', value: 'no-referrer' },
        { key: 'Cache-Control', value: 'private, no-store' },
      ],
    }];
  },
};

export default nextConfig;
