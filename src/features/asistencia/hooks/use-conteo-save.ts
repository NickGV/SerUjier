'use client';

import {
  buildConteoData,
  calculateAllTotals,
  type ConteoDataResult,
} from '@/features/asistencia/lib/calculations';
import { type ConteoState } from '@/features/asistencia/types';
import { saveConteo, updateHistorialRecord } from '@/shared/lib/utils';
import { type DatosServicioBase } from '@/shared/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { servicios } from '../constants';

interface UseConteoSaveProps {
  conteoState: ConteoState;
  datosServicioBase: DatosServicioBase | null;
  setDatosServicioBase: (data: DatosServicioBase | null) => void;
  clearDayData: () => void;
  updateConteo: (updates: Partial<ConteoState>) => void;
  isEditMode: boolean;
  editingRecordId: string | null;
}

interface UseConteoSaveReturn {
  isSaving: boolean;
  showContinuarDialog: boolean;
  setShowContinuarDialog: (show: boolean) => void;
  handleSaveConteo: () => Promise<void>;
  continuarConDominical: () => void;
  noContinarConDominical: () => void;
}

/**
 * Custom hook to handle all counting save logic
 * Includes:
 * - Total calculations
 * - Firebase data construction
 * - Edit mode vs normal mode handling
 * - Consecutive services logic (evangelism/missionary → Sunday)
 */
export function useConteoSave({
  conteoState,
  datosServicioBase,
  setDatosServicioBase,
  clearDayData,
  updateConteo,
  isEditMode,
  editingRecordId,
}: UseConteoSaveProps): UseConteoSaveReturn {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [showContinuarDialog, setShowContinuarDialog] = useState(false);

  /**
   * Validates that at least one usher is selected
   */
  const validateUjieres = (selectedUjieres: string[]): boolean => {
    if (selectedUjieres.length === 0) {
      toast.info('Por favor seleccione al menos un ujier');
      return false;
    }
    return true;
  };

  /**
   * Checks if the service is one that can have a consecutive service
   */
  const isServicioBase = (tipoServicio: string): boolean => {
    return tipoServicio === 'evangelismo' || tipoServicio === 'misionero';
  };

  /**
   * Handles saving in edit mode
   */
  const handleEditModeSave = async (
    conteoData: ConteoDataResult
  ): Promise<boolean> => {
    if (!editingRecordId) return false;

    try {
      await updateHistorialRecord(editingRecordId, conteoData);

      // Clear everything and reset states
      setDatosServicioBase(null);
      clearDayData();

      // Reset consecutive mode if it was active
      updateConteo({
        modoConsecutivo: false,
        tipoServicio: 'dominical',
      });

      toast.success('Registro actualizado exitosamente');
      router.push('/historial');
      return true;
    } catch (error) {
      console.error('Error actualizando registro:', error);
      toast.error('Error al actualizar el registro. Intente nuevamente.');
      return false;
    }
  };

  /**
   * Handles saving a base service (evangelism/missionary)
   */
  const handleServicioBaseSave = async (
    conteoData: ConteoDataResult
  ): Promise<boolean> => {
    try {
      await saveConteo(conteoData);
      setDatosServicioBase(conteoData as DatosServicioBase);
      setShowContinuarDialog(true);
      return true;
    } catch (error) {
      console.error('Error guardando servicio base:', error);
      toast.error('Error al guardar el conteo. Intente nuevamente.');
      return false;
    }
  };

  /**
   * Handles saving a service in consecutive mode
   */
  const handleConsecutiveSave = async (
    conteoData: ConteoDataResult
  ): Promise<boolean> => {
    try {
      await saveConteo(conteoData);

      // Completely reset consecutive mode and clear everything
      setDatosServicioBase(null);
      clearDayData();

      // Reset consecutive mode
      updateConteo({
        modoConsecutivo: false,
        tipoServicio: 'dominical',
      });

      toast.success(
        'Conteo dominical guardado exitosamente. Modo consecutivo finalizado.'
      );
      return true;
    } catch (error) {
      console.error('Error guardando conteo consecutivo:', error);
      toast.error('Error al guardar el conteo. Intente nuevamente.');
      return false;
    }
  };

  /**
   * Handles normal save (non-consecutive)
   */
  const handleNormalSave = async (
    conteoData: ConteoDataResult
  ): Promise<boolean> => {
    try {
      await saveConteo(conteoData);
      clearDayData();
      toast.success('Conteo guardado exitosamente');
      return true;
    } catch (error) {
      console.error('Error guardando conteo:', error);
      toast.error('Error al guardar el conteo. Intente nuevamente.');
      return false;
    }
  };

  /**
   * Main function to save the count
   */
  const handleSaveConteo = async () => {
    // Validate ushers
    if (!validateUjieres(conteoState.selectedUjieres)) {
      return;
    }

    setIsSaving(true);

    try {
      // Calculate totals
      const totals = calculateAllTotals(conteoState, datosServicioBase);

      // Build count data
      const conteoData = buildConteoData(
        totals,
        conteoState,
        servicios,
        datosServicioBase,
        conteoState.selectedUjieres
      );

      // If we're in edit mode, update the existing record
      if (isEditMode && editingRecordId) {
        await handleEditModeSave(conteoData);
        return;
      }

      // Check if it's evangelism/missionary and we're NOT in consecutive mode
      const esServicioBase = isServicioBase(conteoState.tipoServicio);

      if (esServicioBase && !conteoState.modoConsecutivo) {
        // Save evangelism/missionary data and ask if we should continue
        await handleServicioBaseSave(conteoData);
        return;
      }

      if (conteoState.modoConsecutivo) {
        // We're saving Sunday service after evangelism/missionary
        await handleConsecutiveSave(conteoData);
      } else {
        // Normal save
        await handleNormalSave(conteoData);
      }
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Continue with Sunday service after evangelism/missionary
   */
  const continuarConDominical = () => {
    // Activate consecutive mode and reset counters and lists.
    // The base members are now saved in datosServicioBase and will be shown from there.
    // Clear the day lists so they're ready for NEW members in the Sunday service.
    // The base members will be displayed in dialogs via baseMiembros prop (from datosServicioBase).
    updateConteo({
      modoConsecutivo: true,
      tipoServicio: 'dominical',
      hermanos: 0,
      hermanas: 0,
      ninos: 0,
      adolescentes: 0,
      simpatizantesCount: 0,
      hermanosApartados: 0,
      hermanosVisitasCount: 0,
      // Clear the lists - base members are in datosServicioBase and shown via baseMiembros
      simpatizantesDelDia: [],
      hermanosDelDia: [],
      hermanasDelDia: [],
      ninosDelDia: [],
      adolescentesDelDia: [],
      hermanosApartadosDelDia: [],
      hermanosVisitasDelDia: [],
    });
    setShowContinuarDialog(false);
    toast.success(
      'Continuando con el servicio dominical. La base se mantiene y los contadores se reinician.'
    );
  };

  /**
   * Don't continue with Sunday service, finish here
   */
  const noContinarConDominical = () => {
    setShowContinuarDialog(false);
    setDatosServicioBase(null);
    clearDayData();

    // Ensure we're not in consecutive mode
    updateConteo({
      modoConsecutivo: false,
    });

    toast.success('Conteo guardado exitosamente');
  };

  return {
    isSaving,
    showContinuarDialog,
    setShowContinuarDialog,
    handleSaveConteo,
    continuarConDominical,
    noContinarConDominical,
  };
}
