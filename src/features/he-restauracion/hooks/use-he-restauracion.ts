'use client';

import { useFirebaseCRUD } from '@/shared/hooks';
import { type HeRestauracion } from '@/shared/types';
import { toast } from 'sonner';

interface UseHeRestauracionReturn {
  heRestauracion: HeRestauracion[];
  loading: boolean;
  error: string | null;
  isAdding: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  addHeRestauracion: (
    data: Omit<HeRestauracion, 'id' | 'fechaRegistro'> & { nombre: string }
  ) => Promise<void>;
  updateHeRestauracion: (
    id: string,
    data: Partial<Omit<HeRestauracion, 'id' | 'fechaRegistro'>>
  ) => Promise<void>;
  deleteHeRestauracion: (id: string) => Promise<void>;
  refreshHeRestauracion: () => Promise<void>;
}

/**
 * Custom hook for managing heRestauracion using useFirebaseCRUD
 * Handles loading, CRUD operations, and toast notifications
 */
export function useHeRestauracion(): UseHeRestauracionReturn {
  const {
    items: heRestauracion,
    loading,
    error,
    isAdding,
    isUpdating,
    isDeleting,
    addItem,
    updateItem,
    deleteItem,
    refreshItems,
  } = useFirebaseCRUD<HeRestauracion>({
    collectionName: 'heRestauracion',
  });

  const addHeRestauracion = async (
    data: Omit<HeRestauracion, 'id' | 'fechaRegistro'> & { nombre: string }
  ) => {
    if (!data.nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    try {
      const nuevoHeRestauracion = {
        ...data,
        fechaRegistro: new Date().toISOString(),
      };
      await addItem(nuevoHeRestauracion);
    } catch (err) {
      console.error('Error adding heRestauracion:', err);
      throw err;
    }
  };

  const updateHeRestauracion = async (
    id: string,
    data: Partial<Omit<HeRestauracion, 'id' | 'fechaRegistro'>>
  ) => {
    try {
      await updateItem(id, data);
    } catch (err) {
      console.error('Error updating heRestauracion:', err);
      throw err;
    }
  };

  const deleteHeRestauracion = async (id: string) => {
    try {
      await deleteItem(id);
    } catch (err) {
      console.error('Error deleting heRestauracion:', err);
      throw err;
    }
  };

  return {
    heRestauracion,
    loading,
    error,
    isAdding,
    isUpdating,
    isDeleting,
    addHeRestauracion,
    updateHeRestauracion,
    deleteHeRestauracion,
    refreshHeRestauracion: refreshItems,
  };
}
