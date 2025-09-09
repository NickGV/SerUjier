import type { Metadata } from "next";
import React, { ReactNode } from "react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "@/styles/globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Ujier App",
  description: "Aplicación para gestión de ujieres y simpatizantes",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster position="bottom-center" offset="10vh" duration={3000} richColors={true} closeButton={true}/>
      </body>
    </html>
  );
}
