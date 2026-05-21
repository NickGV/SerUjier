'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/shared/ui/button';
import { X, Download } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_STORAGE_KEY = 'pwa-prompt-dismissed';
const DISMISS_SNOOZE_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

function isDismissActive(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_STORAGE_KEY);
    if (!raw) return false;

    // Migración del flag booleano legado: tratar como dismiss reciente.
    if (raw === 'true') {
      localStorage.setItem(
        DISMISS_STORAGE_KEY,
        JSON.stringify({ dismissedAt: Date.now() })
      );
      return true;
    }

    const parsed = JSON.parse(raw) as { dismissedAt?: number };
    if (!parsed?.dismissedAt) return false;

    if (Date.now() - parsed.dismissedAt < DISMISS_SNOOZE_MS) {
      return true;
    }

    localStorage.removeItem(DISMISS_STORAGE_KEY);
    return false;
  } catch {
    return false;
  }
}

function persistDismiss(): void {
  try {
    localStorage.setItem(
      DISMISS_STORAGE_KEY,
      JSON.stringify({ dismissedAt: Date.now() })
    );
  } catch {
    // Storage puede fallar en modo incógnito o quota; ignoramos.
  }
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Verificar si ya está instalado
    const isStandalone = window.matchMedia(
      '(display-mode: standalone)'
    ).matches;
    if (isStandalone) {
      return;
    }

    // Verificar si el usuario lo cerró recientemente (snooze 7 días)
    if (isDismissActive()) {
      return;
    }

    let showTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const handler = (e: Event) => {
      // Si el usuario lo cerró recientemente, no volver a mostrarlo aunque
      // el evento se dispare nuevamente (puede pasar al volver a enfocar la pestaña).
      if (isDismissActive()) {
        return;
      }

      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Mostrar el prompt después de 3 segundos
      if (showTimeoutId !== null) {
        clearTimeout(showTimeoutId);
      }
      showTimeoutId = setTimeout(() => {
        // Revalidar snooze al momento de mostrar.
        if (isDismissActive()) {
          return;
        }
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      if (showTimeoutId !== null) {
        clearTimeout(showTimeoutId);
      }
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.info('PWA instalada');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    persistDismiss();
    // Evitar re-mostrarlo en la misma sesión si el evento se dispara otra vez.
    setDeferredPrompt(null);
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
