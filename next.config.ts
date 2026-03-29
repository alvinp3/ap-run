import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Security and caching headers
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400' },
          { key: 'Content-Type', value: 'application/manifest+json' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },

  // Redirect bare /race to Houston as default
  async redirects() {
    return [
      {
        source: '/race',
        destination: '/race/houston',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
