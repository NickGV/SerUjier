import type { NextConfig } from "next";

const config = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: false,
  },
  webpack: (config, { isServer }) => {
    // Configuración para manejar mejor los módulos de Firebase
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
} satisfies NextConfig;

export default config;
