'use client';

import { type ConteoState } from '@/features/asistencia/types';
import {
  getHistorialRecordById,
  type HistorialRecord,
} from '@/shared/firebase';
import { type DatosServicioBase } from '@/shared/types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface UseConteoEditModeProps {
  editId: string | null;
  isLoaded: boolean;
  loading: boolean;
  loadHistorialData: (
    historialData: HistorialRecord,
    editRecordId?: string
  ) => void;
  clearDayData: () => void;
  updateConteo: (updates: Partial<ConteoState>) => void;
  setDatosServicioBase: (data: DatosServicioBase | null) => void;
  conteoState: ConteoState;
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
  conteoState,
}: UseConteoEditModeProps): UseConteoEditModeReturn {
  const router = useRouter();
  const [loadingEdit, setLoadingEdit] = useState(false);

  /**
   * Effect to load history data when in edit mode
   * Also checks if we're already in edit mode from persistent state
   */
  useEffect(() => {
    const loadEditData = async () => {
      // Si ya estamos en modo edición (desde localStorage), no recargar
      if (conteoState.isEditMode && conteoState.editingRecordId && !editId) {
        // Ya estamos en modo edición, no hacer nada
        return;
      }

      // Si hay un editId en la URL y no hemos cargado aún
      if (editId && isLoaded && !loading && !conteoState.isEditMode) {
        try {
          setLoadingEdit(true);
          const historialRecord = await getHistorialRecordById(editId);
          loadHistorialData(historialRecord, editId);
          toast.success('Datos cargados para edición');
        } catch (error) {
          console.error('Error cargando registro para edición:', error);
          toast.error('Error al cargar el registro para edición');
          router.push('/historial');
        } finally {
          setLoadingEdit(false);
        }
      }
    };

    loadEditData();
  }, [
    editId,
    isLoaded,
    loading,
    loadHistorialData,
    router,
    conteoState.isEditMode,
    conteoState.editingRecordId,
  ]);

  /**
   * Cancels edit mode and clears data
   */
  const handleCancelEdit = () => {
    if (
      confirm(
        '¿Desea cancelar la edición? Los cambios no guardados se perderán.'
      )
    ) {
      // Clear everything and reset states
      setDatosServicioBase(null);
      clearDayData();

      // Reset consecutive mode if it was active
      updateConteo({
        modoConsecutivo: false,
        tipoServicio: 'dominical',
      });

      router.push('/historial');
    }
  };

  return {
    isEditMode: conteoState.isEditMode,
    editingRecordId: conteoState.editingRecordId,
    loadingEdit,
    handleCancelEdit,
  };
}
