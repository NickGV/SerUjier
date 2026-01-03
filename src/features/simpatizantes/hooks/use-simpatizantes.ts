'use client';

import { useFirebaseCRUD } from '@/shared/hooks';
import { type Simpatizante } from '@/shared/types';
import { toast } from 'sonner';

interface UseSimpatizantesReturn {
  simpatizantes: Simpatizante[];
  loading: boolean;
  error: string | null;
  isAdding: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  addSimpatizante: (
    data: Omit<Simpatizante, 'id' | 'fechaRegistro'> & { nombre: string }
  ) => Promise<void>;
  updateSimpatizante: (
    id: string,
    data: Partial<Omit<Simpatizante, 'id' | 'fechaRegistro'>>
  ) => Promise<void>;
  deleteSimpatizante: (id: string) => Promise<void>;
  refreshSimpatizantes: () => Promise<void>;
}

/**
 * Custom hook for managing simpatizantes using useFirebaseCRUD
 * Handles loading, CRUD operations, and toast notifications
 */
export function useSimpatizantes(): UseSimpatizantesReturn {
  const {
    items: simpatizantes,
    loading,
    error,
    isAdding,
    isUpdating,
    isDeleting,
    addItem,
    updateItem,
    deleteItem,
    refreshItems,
  } = useFirebaseCRUD<Simpatizante>({
    collectionName: 'simpatizantes',
  });

  const addSimpatizante = async (
    data: Omit<Simpatizante, 'id' | 'fechaRegistro'> & { nombre: string }
  ) => {
    if (!data.nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    try {
      const nuevoSimpatizante = {
        ...data,
        fechaRegistro: new Date().toISOString(),
      };
      await addItem(nuevoSimpatizante);
    } catch (err) {
      console.error('Error adding simpatizante:', err);
      throw err;
    }
  };

  const updateSimpatizante = async (
    id: string,
    data: Partial<Omit<Simpatizante, 'id' | 'fechaRegistro'>>
  ) => {
    try {
      await updateItem(id, data);
    } catch (err) {
      console.error('Error updating simpatizante:', err);
      throw err;
    }
  };

  const deleteSimpatizante = async (id: string) => {
    try {
      await deleteItem(id);
    } catch (err) {
      console.error('Error deleting simpatizante:', err);
      throw err;
    }
  };

  return {
    simpatizantes,
    loading,
    error,
    isAdding,
    isUpdating,
    isDeleting,
    addSimpatizante,
    updateSimpatizante,
    deleteSimpatizante,
    refreshSimpatizantes: refreshItems,
  };
}
