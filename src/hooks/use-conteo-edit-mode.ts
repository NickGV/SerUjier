"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getHistorialRecordById } from "@/lib/utils";
import { DatosServicioBase } from "@/app/types";
import { HistorialRecord } from "@/components/historial/utils";
import { ConteoState } from "@/components/conteo/types";

interface UseConteoEditModeProps {
  editId: string | null;
  isLoaded: boolean;
  loading: boolean;
  loadHistorialData: (historialData: HistorialRecord) => void;
  clearDayData: () => void;
  updateConteo: (updates: Partial<ConteoState>) => void;
  setDatosServicioBase: (data: DatosServicioBase | null) => void;
}

interface UseConteoEditModeReturn {
  isEditMode: boolean;
  editingRecordId: string | null;
  loadingEdit: boolean;
  handleCancelEdit: () => void;
}

/**
 * Custom hook to handle counting edit mode
 * Manages:
 * - Edit mode states
 * - Loading data from history
 * - Edit cancellation
 */
export function useConteoEditMode({
  editId,
  isLoaded,
  loading,
  loadHistorialData,
  clearDayData,
  updateConteo,
  setDatosServicioBase,
}: UseConteoEditModeProps): UseConteoEditModeReturn {
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);

  /**
   * Effect to load history data when in edit mode
   */
  useEffect(() => {
    const loadEditData = async () => {
      if (editId && isLoaded && !loading) {
        try {
          setLoadingEdit(true);
          const historialRecord = await getHistorialRecordById(editId);
          loadHistorialData(historialRecord);
          setIsEditMode(true);
          setEditingRecordId(editId);
          toast.success("Datos cargados para edición");
        } catch (error) {
          console.error("Error cargando registro para edición:", error);
          toast.error("Error al cargar el registro para edición");
          router.push("/historial");
        } finally {
          setLoadingEdit(false);
        }
      }
    };

    loadEditData();
  }, [editId, isLoaded, loading, loadHistorialData, router]);

  /**
   * Cancels edit mode and clears data
   */
  const handleCancelEdit = () => {
    if (
      confirm(
        "¿Desea cancelar la edición? Los cambios no guardados se perderán."
      )
    ) {
      // Clear everything and reset states
      setDatosServicioBase(null);
      clearDayData();

      // Reset consecutive mode if it was active
      updateConteo({
        modoConsecutivo: false,
        tipoServicio: "dominical",
      });

      router.push("/historial");
    }
  };

  return {
    isEditMode,
    editingRecordId,
    loadingEdit,
    handleCancelEdit,
  };
}


