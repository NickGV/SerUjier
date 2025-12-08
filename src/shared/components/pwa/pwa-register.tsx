"use client";

import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Service Worker registrado:", registration.scope);

            // Verificar actualizaciones cada hora
            setInterval(() => {
              registration.update();
            }, 60 * 60 * 1000);
          })
          .catch((error) => {
            console.error("Error al registrar Service Worker:", error);
          });
      });

      // Escuchar mensajes del Service Worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type === "CACHE_UPDATED") {
          console.log("Cache actualizado");
        }
      });
    }

    // Agregar listeners para detectar estado de conexión
    window.addEventListener("online", () => {
      console.log("Conexión restaurada");
    });

    window.addEventListener("offline", () => {
      console.log("Sin conexión");
    });
  }, []);

  return null;
}
