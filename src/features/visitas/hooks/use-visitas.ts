'use client';

import { useFirebaseCRUD } from '@/shared/hooks';
import { type Visita } from '@/shared/types';
import { toast } from 'sonner';

interface UseVisitasReturn {
  visitas: Visita[];
  loading: boolean;
  error: string | null;
  isAdding: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  addVisita: (
    data: Omit<Visita, 'id' | 'fechaRegistro'> & { nombre: string }
  ) => Promise<void>;
  updateVisita: (
    id: string,
    data: Partial<Omit<Visita, 'id' | 'fechaRegistro'>>
  ) => Promise<void>;
  deleteVisita: (id: string) => Promise<void>;
  refreshVisitas: () => Promise<void>;
}

/**
 * Custom hook for managing visitas using useFirebaseCRUD
 * Handles loading, CRUD operations, and toast notifications
 */
export function useVisitas(): UseVisitasReturn {
  const {
    items: visitas,
    loading,
    error,
    isAdding,
    isUpdating,
    isDeleting,
    addItem,
    updateItem,
    deleteItem,
    refreshItems,
  } = useFirebaseCRUD<Visita>({
    collectionName: 'visitas',
  });

  const addVisita = async (
    data: Omit<Visita, 'id' | 'fechaRegistro'> & { nombre: string }
  ) => {
    if (!data.nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    try {
      const nuevaVisita = {
        ...data,
        fechaRegistro: new Date().toISOString(),
      };
      await addItem(nuevaVisita);
    } catch (err) {
      console.error('Error adding visita:', err);
      throw err;
    }
  };

  const updateVisita = async (
    id: string,
    data: Partial<Omit<Visita, 'id' | 'fechaRegistro'>>
  ) => {
    try {
      await updateItem(id, data);
    } catch (err) {
      console.error('Error updating visita:', err);
      throw err;
    }
  };

  const deleteVisita = async (id: string) => {
    try {
      await deleteItem(id);
    } catch (err) {
      console.error('Error deleting visita:', err);
      throw err;
    }
  };

  return {
    visitas,
    loading,
    error,
    isAdding,
    isUpdating,
    isDeleting,
    addVisita,
    updateVisita,
    deleteVisita,
    refreshVisitas: refreshItems,
  };
}
