"use client";

import { useEffect, useState } from "react";
import { Button } from "@/shared/ui/button";
import { X, Download } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Verificar si ya está instalado
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;
    if (isStandalone) {
      return;
    }

    // Verificar si ya se mostró antes
    const promptDismissed = localStorage.getItem("pwa-prompt-dismissed");
    if (promptDismissed === "true") {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Mostrar el prompt después de 3 segundos
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("PWA instalada");
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-prompt-dismissed", "true");
  };

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-20 z-50 mx-4 mb-4 animate-in slide-in-from-bottom-5">
      <Card className="shadow-lg border-2">
        <CardHeader className="relative pb-3">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="text-lg flex items-center gap-2">
            <Download className="h-5 w-5" />
            Instalar SerUjier
          </CardTitle>
          <CardDescription>
            Accede más rápido y úsala sin conexión
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-3">
          <p className="text-sm text-muted-foreground">
            Instala la aplicación en tu dispositivo para una mejor experiencia:
          </p>
          <ul className="mt-2 text-sm space-y-1 text-muted-foreground">
            <li>• Acceso rápido desde tu pantalla de inicio</li>
            <li>• Funciona sin conexión</li>
            <li>• Notificaciones en tiempo real</li>
          </ul>
        </CardContent>
        <CardFooter className="gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDismiss}
            className="flex-1"
          >
            Ahora no
          </Button>
          <Button size="sm" onClick={handleInstall} className="flex-1">
            Instalar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
