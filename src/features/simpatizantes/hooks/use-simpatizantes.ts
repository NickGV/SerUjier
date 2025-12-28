'use client';

import {
  addSimpatizante as addSimpatizanteToFirebase,
  deleteSimpatizante as deleteSimpatizanteFromFirebase,
  fetchSimpatizantes,
  updateSimpatizante as updateSimpatizanteInFirebase,
} from '@/shared/lib/utils';
import { type Simpatizante } from '@/shared/types';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface UseSimpatizantesReturn {
  simpatizantes: Simpatizante[];
  loading: boolean;
  error: string | null;
  isAdding: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  addSimpatizante: (
    data: Omit<Simpatizante, 'id' | 'fechaRegistro'>
  ) => Promise<void>;
  updateSimpatizante: (
    id: string,
    data: Partial<Omit<Simpatizante, 'id' | 'fechaRegistro'>>
  ) => Promise<void>;
  deleteSimpatizante: (id: string) => Promise<void>;
  refreshSimpatizantes: () => Promise<void>;
}

/**
 * Custom hook for managing simpatizantes
 * Handles loading, CRUD operations, and toast notifications
 */
export function useSimpatizantes(): UseSimpatizantesReturn {
  const [simpatizantes, setSimpatizantes] = useState<Simpatizante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Load simpatizantes from Firebase
   */
  const loadSimpatizantes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSimpatizantes();
      setSimpatizantes(data);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Error cargando simpatizantes';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Add a new simpatizante
   */
  const addSimpatizanteHandler = async (
    data: Omit<Simpatizante, 'id' | 'fechaRegistro'>
  ) => {
    if (!data.nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    setIsAdding(true);
    try {
      const nuevoSimpatizante = {
        ...data,
        fechaRegistro: new Date().toISOString(),
      };
      const result = await addSimpatizanteToFirebase(nuevoSimpatizante);
      const created: Simpatizante = {
        ...nuevoSimpatizante,
        id: result.id,
      };
      setSimpatizantes([...simpatizantes, created]);
      toast.success(`Simpatizante "${data.nombre}" agregado exitosamente`);
    } catch (err) {
      console.error('Error adding simpatizante:', err);
      const errorMsg = 'Error al agregar simpatizante';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsAdding(false);
    }
  };

  /**
   * Update an existing simpatizante
   */
  const updateSimpatizanteHandler = async (
    id: string,
    data: Partial<Omit<Simpatizante, 'id' | 'fechaRegistro'>>
  ) => {
    setIsUpdating(true);
    try {
      await updateSimpatizanteInFirebase(id, data);
      setSimpatizantes(
        simpatizantes.map((s) => (s.id === id ? { ...s, ...data } : s))
      );
      toast.success(`Simpatizante actualizado exitosamente`);
    } catch (err) {
      console.error('Error updating simpatizante:', err);
      const errorMsg = 'Error al actualizar simpatizante';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Delete a simpatizante
   */
  const deleteSimpatizanteHandler = async (id: string) => {
    setIsDeleting(true);
    try {
      const simpatizante = simpatizantes.find((s) => s.id === id);
      await deleteSimpatizanteFromFirebase(id);
      setSimpatizantes(simpatizantes.filter((s) => s.id !== id));
      toast.success(
        `Simpatizante "${simpatizante?.nombre || ''}" eliminado exitosamente`
      );
    } catch (err) {
      console.error('Error deleting simpatizante:', err);
      const errorMsg = 'Error al eliminar simpatizante';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  // Load simpatizantes on mount
  useEffect(() => {
    loadSimpatizantes();
  }, []);

  return {
    simpatizantes,
    loading,
    error,
    isAdding,
    isUpdating,
    isDeleting,
    addSimpatizante: addSimpatizanteHandler,
    updateSimpatizante: updateSimpatizanteHandler,
    deleteSimpatizante: deleteSimpatizanteHandler,
    refreshSimpatizantes: loadSimpatizantes,
  };
}
