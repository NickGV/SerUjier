'use client';

import { useFirebaseCRUD } from '@/shared/hooks';
import { type Miembro, type miembroCategoria } from '@/shared/types';
import { toast } from 'sonner';

interface UseMiembrosReturn {
  miembros: Miembro[];
  loading: boolean;
  error: string | null;
  isAdding: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  addMiembro: (data: Omit<Miembro, 'id'> & { nombre: string }) => Promise<void>;
  updateMiembro: (id: string, data: Partial<Miembro>) => Promise<void>;
  deleteMiembro: (id: string) => Promise<void>;
  refreshMiembros: () => Promise<void>;
  getMiembrosByCategoria: (categoria: miembroCategoria) => Miembro[];
}

/**
 * Custom hook for managing miembros using useFirebaseCRUD
 * Handles loading, CRUD operations, and toast notifications
 */
export function useMiembros(): UseMiembrosReturn {
  const {
    items: miembros,
    loading,
    error,
    isAdding,
    isUpdating,
    isDeleting,
    addItem,
    updateItem,
    deleteItem,
    refreshItems,
  } = useFirebaseCRUD<Miembro>({
    collectionName: 'miembros',
    orderByField: 'nombre',
    orderDirection: 'asc',
  });

  const addMiembro = async (data: Omit<Miembro, 'id'> & { nombre: string }) => {
    if (!data.nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    try {
      await addItem(data);
    } catch (err) {
      console.error('Error adding miembro:', err);
      throw err;
    }
  };

  const updateMiembro = async (id: string, data: Partial<Miembro>) => {
    try {
      await updateItem(id, data);
    } catch (err) {
      console.error('Error updating miembro:', err);
      throw err;
    }
  };

  const deleteMiembro = async (id: string) => {
    try {
      await deleteItem(id);
    } catch (err) {
      console.error('Error deleting miembro:', err);
      throw err;
    }
  };

  const getMiembrosByCategoria = (categoria: miembroCategoria): Miembro[] => {
    return miembros.filter((m) => m.categoria === categoria);
  };

  return {
    miembros,
    loading,
    error,
    isAdding,
    isUpdating,
    isDeleting,
    addMiembro,
    updateMiembro,
    deleteMiembro,
    refreshMiembros: refreshItems,
    getMiembrosByCategoria,
  };
}
