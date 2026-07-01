import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "html5-qrcode",
    ],
  },

  /**
   * Required for Next.js 16
   * Prevents Turbopack warning
   */
  turbopack: {},

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Permissions-Policy",
            value:
              "camera=(self), microphone=(self), geolocation=(self)",
          },
        ],
      },

      {
        source: "/manifest.json",
        headers: [
          {
            key: "Content-Type",
            value: "application/manifest+json",
          },
        ],
      },

      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value:
              "application/javascript; charset=utf-8",
          },
        ],
      },
    ];
  },
};

export default nextConfig;