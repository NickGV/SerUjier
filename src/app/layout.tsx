import { ThemeProvider } from '@/shared/components/providers/theme-provider';
import {
  InstallPrompt,
  PWARegister,
  PWAUpdatePrompt,
} from '@/shared/components/pwa';
import type { Metadata, Viewport } from 'next';
import { type ReactNode } from 'react';
import { Toaster } from 'sonner';
import './globals.css';

// TODO: Agregar logo
export const metadata: Metadata = {
  title: {
    default: 'SerUjier',
    template: '%s | SerUjier',
  },
  description:
    'Aplicación para gestión de ujieres, simpatizantes y miembros. Registra asistencias y administra información.',
  keywords: ['ujier', 'iglesia', 'asistencia', 'gestión', 'simpatizantes'],
  authors: [{ name: 'SerUjier Team' }],
  creator: 'SerUjier',
  publisher: 'SerUjier',
  formatDetection: {
    telephone: false,
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon.ico', sizes: 'any' },
    ],
    apple: [
      {
        url: '/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/icons/android-chrome-512x512.png',
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SerUjier',
    startupImage: [
      {
        url: '/icons/apple-touch-icon.png',
        media:
          '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'SerUjier',
    title: 'SerUjier - Gestión de Ujieres',
    description: 'Aplicación para gestión de ujieres, simpatizantes y miembros',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#4a90e2' },
    { media: '(prefers-color-scheme: dark)', color: '#1e3a5f' },
  ],
  viewportFit: 'cover',
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
        <link rel="icon" type="image/x-icon" href="/icons/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icons/favicon-16x16.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/favicon-32x32.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/apple-touch-icon.png"
        />
        <link
          rel="apple-touch-startup-image"
          href="/icons/apple-touch-icon.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-TileColor" content="#4a90e2" />
        <meta
          name="msapplication-TileImage"
          content="/icons/android-chrome-192x192.png"
        />
        <meta name="msapplication-config" content="/browserconfig.xml" />
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
