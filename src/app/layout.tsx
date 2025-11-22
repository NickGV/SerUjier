import type { Metadata, Viewport } from "next";
import React, { ReactNode } from "react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "@/styles/globals.css";
import { Toaster } from "sonner";
import { InstallPrompt, PWAUpdatePrompt, PWARegister } from "@/components/pwa";

// TODO: Agregar logo
export const metadata: Metadata = {
  title: {
    default: "SerUjier",
    template: "%s | SerUjier",
  },
  description:
    "Aplicación para gestión de ujieres, simpatizantes y miembros. Registra asistencias y administra información.",
  keywords: ["ujier", "iglesia", "asistencia", "gestión", "simpatizantes"],
  authors: [{ name: "SerUjier Team" }],
  creator: "SerUjier",
  publisher: "SerUjier",
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
  icons: {
    icon: "./favicon.ico",
    apple: [
      { url: "/placeholder-logo.png", sizes: "192x192", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SerUjier",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "SerUjier",
    title: "SerUjier - Gestión de Ujieres",
    description: "Aplicación para gestión de ujieres, simpatizantes y miembros",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#4a90e2" },
    { media: "(prefers-color-scheme: dark)", color: "#1e3a5f" },
  ],
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="application-name" content="SerUjier" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="SerUjier" />
        <link rel="apple-touch-icon" href="/placeholder-logo.png" />
        <link rel="apple-touch-startup-image" href="/placeholder-logo.png" />
      </head>
      <body>
        <ThemeProvider>
          <PWARegister />
          {children}
          <InstallPrompt />
          <PWAUpdatePrompt />
        </ThemeProvider>
        <Toaster
          position="bottom-center"
          offset="10vh"
          duration={3000}
          richColors={true}
          closeButton={true}
        />
      </body>
    </html>
  );
}
