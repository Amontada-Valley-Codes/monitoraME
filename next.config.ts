import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-3d557142942b48638297e66492bf0608.r2.dev', 
        port: '',
        pathname: '/**',
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/:path*', 
      },
    ];
  },
};

export default nextConfig;