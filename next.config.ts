import type { NextConfig } from "next";

const config = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: false,
  },
  // Configuración para producción
  output: 'standalone',
  // Manejar mejor los errores de cookies
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
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
