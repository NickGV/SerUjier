"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/shared/contexts/user-context";
import { DatosServicioBase } from "@/shared/types";
import { calculateManualCounters } from "@/features/asistencia/utils/conteo-calculations";
import {
  normalizeUjieres,
  getUjierSelectorValue,
  getCustomUjierString,
} from "@/features/asistencia/utils/ujier-utils";

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
  isEditMode: boolean;
  editingRecordId: string | null;
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
  hermanosVisitasDelDia: Array<{
    id: string;
    nombre: string;
    iglesia?: string;
  }>;
  selectedUjieres: string[];
  searchMiembros: string;
  datosServicioBase: DatosServicioBase | null;
  [key: string]: unknown;
}

const STORAGE_KEY = "conteo-persistente";

// Función para obtener la fecha local en formato YYYY-MM-DD
const getLocalDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const initialState: ConteoState = {
  hermanos: 0,
  hermanas: 0,
  ninos: 0,
  adolescentes: 0,
  simpatizantesCount: 0,
  hermanosApartados: 0,
  hermanosVisitasCount: 0,
  fecha: getLocalDateString(), // Usar función local en lugar de toISOString()
  tipoServicio: "dominical",
  ujierSeleccionado: "",
  ujierPersonalizado: "",
  modoConsecutivo: false,
  isEditMode: false,
  editingRecordId: null,
  simpatizantesDelDia: [],
  hermanosDelDia: [],
  hermanasDelDia: [],
  ninosDelDia: [],
  adolescentesDelDia: [],
  hermanosApartadosDelDia: [],
  hermanosVisitasDelDia: [],
  selectedUjieres: [],
  searchMiembros: "",
  datosServicioBase: null,
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
        const today = getLocalDateString(); // Usar función local
        if (parsedState.fecha === today) {
          setConteoState(parsedState);
        } else {
          // Si es un día diferente, resetear pero mantener la fecha actual
          setConteoState({
            ...initialState,
            fecha: today, // Usar función local
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
    if (
      isLoaded &&
      user &&
      user.nombre &&
      conteoState.selectedUjieres.length === 0
    ) {
      // Solo agregar si no hay ujieres seleccionados y el usuario tiene nombre
      setConteoState((prev) => ({
        ...prev,
        selectedUjieres: [user.nombre],
        ujierSeleccionado: user.nombre,
        ujierPersonalizado: "",
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
    setConteoState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Función para resetear el conteo
  const resetConteo = useCallback(() => {
    setConteoState(initialState);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Función para limpiar solo los datos del día (mantener configuración)
  const clearDayData = useCallback(() => {
    setConteoState((prev) => ({
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
      datosServicioBase: null,
      isEditMode: false,
      editingRecordId: null,
    }));
  }, []);

  // Función para cargar datos desde un registro de historial para edición
  const loadHistorialData = useCallback(
    (
      historialData: {
        fecha: string;
        servicio: string;
        ujier: string | string[];
        hermanos: number;
        hermanas: number;
        ninos: number;
        adolescentes: number;
        simpatizantes: number;
        hermanosApartados?: number;
        hermanosVisitas?: number;
        simpatizantesAsistieron?: Array<{ id: string; nombre: string }>;
        miembrosAsistieron?: {
          hermanos?: Array<{ id: string; nombre: string }>;
          hermanas?: Array<{ id: string; nombre: string }>;
          ninos?: Array<{ id: string; nombre: string }>;
          adolescentes?: Array<{ id: string; nombre: string }>;
          hermanosApartados?: Array<{ id: string; nombre: string }>;
        };
        hermanosVisitasAsistieron?: Array<{
          id: string;
          nombre: string;
          iglesia?: string;
        }>;
      },
      editRecordId?: string,
    ) => {
      // Convertir el servicio al valor correcto
      const servicioValue = historialData.servicio.toLowerCase();

      // Normalizar ujieres a array usando la utilidad
      const ujieresArray = normalizeUjieres(historialData.ujier);

      // Calcular los contadores manuales usando la utilidad
      const manualCounters = calculateManualCounters(historialData);

      // Cargar los datos del historial en el estado de conteo
      setConteoState({
        hermanos: manualCounters.hermanos,
        hermanas: manualCounters.hermanas,
        ninos: manualCounters.ninos,
        adolescentes: manualCounters.adolescentes,
        simpatizantesCount: manualCounters.simpatizantes,
        hermanosApartados: manualCounters.hermanosApartados,
        hermanosVisitasCount: manualCounters.hermanosVisitas,
        fecha: historialData.fecha,
        tipoServicio: servicioValue,
        ujierSeleccionado: getUjierSelectorValue(historialData.ujier),
        ujierPersonalizado: getCustomUjierString(historialData.ujier),
        selectedUjieres: ujieresArray,
        modoConsecutivo: false,
        simpatizantesDelDia: historialData.simpatizantesAsistieron || [],
        hermanosDelDia: historialData.miembrosAsistieron?.hermanos || [],
        hermanasDelDia: historialData.miembrosAsistieron?.hermanas || [],
        ninosDelDia: historialData.miembrosAsistieron?.ninos || [],
        adolescentesDelDia:
          historialData.miembrosAsistieron?.adolescentes || [],
        hermanosApartadosDelDia:
          historialData.miembrosAsistieron?.hermanosApartados || [],
        hermanosVisitasDelDia: historialData.hermanosVisitasAsistieron || [],
        searchMiembros: "",
        datosServicioBase: null,
        isEditMode: !!editRecordId,
        editingRecordId: editRecordId || null,
      });
    },
    [],
  );

  // Funciones para manejar datosServicioBase
  const setDatosServicioBase = useCallback((data: DatosServicioBase | null) => {
    setConteoState((prev) => ({ ...prev, datosServicioBase: data }));
  }, []);

  const clearDatosServicioBase = useCallback(() => {
    setConteoState((prev) => ({ ...prev, datosServicioBase: null }));
  }, []);

  return {
    conteoState,
    updateConteo,
    resetConteo,
    clearDayData,
    loadHistorialData,
    isLoaded,
    setDatosServicioBase,
    clearDatosServicioBase,
  };
}
