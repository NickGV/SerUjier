"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PWAUpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                setRegistration(reg);
                setShowPrompt(true);
              }
            });
          }
        });
      });
    }
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
      window.location.reload();
    }
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-20 z-50 mx-4 mb-4 animate-in slide-in-from-bottom-5">
      <Card className="shadow-lg border-2 bg-primary text-primary-foreground">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Nueva versión disponible
          </CardTitle>
          <CardDescription className="text-primary-foreground/80">
            Actualiza para obtener las últimas mejoras
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-3">
          <p className="text-sm">
            Hay una nueva versión de SerUjier disponible. Actualiza ahora para
            disfrutar de las últimas funciones y mejoras.
          </p>
        </CardContent>
        <CardFooter className="gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowPrompt(false)}
            className="flex-1"
          >
            Más tarde
          </Button>
          <Button
            size="sm"
            onClick={handleUpdate}
            className="flex-1 bg-white text-primary hover:bg-white/90"
          >
            Actualizar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
