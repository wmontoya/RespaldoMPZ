import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: "/basura",
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  async headers() {
    return [
      {
        source: '/basura/sw.js',
        headers: [{ key: 'Cache-Control', value: 'no-store, must-revalidate' }],
      },
      {
        source: '/basura/manifest.:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, must-revalidate' }],
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_API_REQUEST: process.env.NEXT_API_REQUEST,
    NEXT_PUBLIC_MANIFEST_PATH: process.env.NEXT_PUBLIC_MANIFEST_PATH,
    NEXT_PUBLIC_ENCRYPTION_KEY: process.env.NEXT_PUBLIC_ENCRYPTION_KEY,
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    NEXT_PUBLIC_ICON_ESCUDO:process.env.NEXT_PUBLIC_ICON_ESCUDO
  },
  turbopack: {},
};

// 👉 Wrapping your configuration with PWA
export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  scope: "/basura",
  disable: process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_SW_DEV !== "true",
  sw: "sw.js",
  swSrc: "public/sw.js",
})(nextConfig);
