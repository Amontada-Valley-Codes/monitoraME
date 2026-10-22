import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: false,
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
    }, {
      // Painel administrativo: dados privados, sem cache compartilhado nem indexação.
      source: '/admin/:path*',
      headers: [
        { key: 'Cache-Control', value: 'private, no-store' },
        { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
      ],
    }];
  },
};

export default nextConfig;
