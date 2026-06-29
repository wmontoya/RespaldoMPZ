import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    webpack: (config) => {
    config.externals = config.externals || [];
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false, // evita errores de extensión
      },
    });
    return config;
  },
    transpilePackages: ["yaml"],
};

export default nextConfig;
