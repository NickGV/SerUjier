"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/contexts/user-context";

interface ConteoState {
  hermanos: number;
  hermanas: number;
  ninos: number;
  adolescentes: number;
  simpatizantesCount: number;
  hermanosApartados: number;
  hermanosVisitasCount: number;
  fecha: string;
  tipoServicio: string;
  ujierSeleccionado: string;
  ujierPersonalizado: string;
  modoConsecutivo: boolean;
  simpatizantesDelDia: Array<{
    id: string;
    nombre: string;
    telefono?: string;
    notas?: string;
    fechaRegistro?: string;
  }>;
  hermanosDelDia: Array<{ id: string; nombre: string }>;
  hermanasDelDia: Array<{ id: string; nombre: string }>;
  ninosDelDia: Array<{ id: string; nombre: string }>;
  adolescentesDelDia: Array<{ id: string; nombre: string }>;
  hermanosApartadosDelDia: Array<{ id: string; nombre: string }>;
  hermanosVisitasDelDia: Array<{ id: string; nombre: string }>;
  selectedUjieres: string[];
  searchMiembros: string;
}

const STORAGE_KEY = "conteo-persistente";

const initialState: ConteoState = {
  hermanos: 0,
  hermanas: 0,
  ninos: 0,
  adolescentes: 0,
  simpatizantesCount: 0,
  hermanosApartados: 0,
  hermanosVisitasCount: 0,
  fecha: new Date().toISOString().split("T")[0],
  tipoServicio: "dominical",
  ujierSeleccionado: "",
  ujierPersonalizado: "",
  modoConsecutivo: false,
  simpatizantesDelDia: [],
  hermanosDelDia: [],
  hermanasDelDia: [],
  ninosDelDia: [],
  adolescentesDelDia: [],
  hermanosApartadosDelDia: [],
  hermanosVisitasDelDia: [],
  selectedUjieres: [],
  searchMiembros: "",
};

export function usePersistentConteo() {
  const { user } = useUser();
  const [conteoState, setConteoState] = useState<ConteoState>(initialState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar estado desde localStorage al montar el componente
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedState = JSON.parse(saved);
        // Verificar que la fecha guardada sea de hoy, si no, resetear
        const today = new Date().toISOString().split("T")[0];
        if (parsedState.fecha === today) {
          setConteoState(parsedState);
        } else {
          // Si es un día diferente, resetear pero mantener la fecha actual
          setConteoState({
            ...initialState,
            fecha: today,
          });
        }
      }
    } catch (error) {
      console.error("Error cargando conteo desde localStorage:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Agregar automáticamente el ujier del usuario cuando se carga el estado
  useEffect(() => {
    if (isLoaded && user && user.nombre && conteoState.selectedUjieres.length === 0) {
      // Solo agregar si no hay ujieres seleccionados y el usuario tiene nombre
      setConteoState(prev => ({
        ...prev,
        selectedUjieres: [user.nombre],
        ujierSeleccionado: user.nombre,
        ujierPersonalizado: ""
      }));
    }
  }, [isLoaded, user, conteoState.selectedUjieres.length]);

  // Guardar estado en localStorage cada vez que cambie
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(conteoState));
      } catch (error) {
        console.error("Error guardando conteo en localStorage:", error);
      }
    }
  }, [conteoState, isLoaded]);

  // Función para actualizar el estado
  const updateConteo = useCallback((updates: Partial<ConteoState>) => {
    setConteoState(prev => ({ ...prev, ...updates }));
  }, []);

  // Función para resetear el conteo
  const resetConteo = useCallback(() => {
    setConteoState(initialState);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Función para limpiar solo los datos del día (mantener configuración)
  const clearDayData = useCallback(() => {
    setConteoState(prev => ({
      ...prev,
      hermanos: 0,
      hermanas: 0,
      ninos: 0,
      adolescentes: 0,
      simpatizantesCount: 0,
      hermanosApartados: 0,
      hermanosVisitasCount: 0,
      simpatizantesDelDia: [],
      hermanosDelDia: [],
      hermanasDelDia: [],
      ninosDelDia: [],
      adolescentesDelDia: [],
      hermanosApartadosDelDia: [],
      hermanosVisitasDelDia: [],
      selectedUjieres: [],
      ujierSeleccionado: "",
      ujierPersonalizado: "",
      searchMiembros: "",
    }));
  }, []);

  return {
    conteoState,
    updateConteo,
    resetConteo,
    clearDayData,
    isLoaded,
  };
}
