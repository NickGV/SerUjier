'use client';

import { type Usuario } from '@/shared/firebase/usuarios';
import { useFirebaseCRUD } from '@/shared/hooks';
import { toast } from 'sonner';

interface UseUjieresReturn {
  ujieres: Usuario[];
  loading: boolean;
  error: string | null;
  isAdding: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  addUjier: (data: Omit<Usuario, 'id'>) => Promise<void>;
  updateUjier: (id: string, data: Partial<Usuario>) => Promise<void>;
  deleteUjier: (id: string) => Promise<void>;
  refreshUjieres: () => Promise<void>;
  getActiveUjieres: () => string[];
}

/**
 * Custom hook for managing ujieres using useFirebaseCRUD
 * Handles loading, CRUD operations, and toast notifications
 */
export function useUjieres(): UseUjieresReturn {
  const {
    items: ujieres,
    loading,
    error,
    isAdding,
    isUpdating,
    isDeleting,
    addItem,
    updateItem,
    deleteItem,
    refreshItems,
  } = useFirebaseCRUD<Usuario>({
    collectionName: 'usuarios',
    orderByField: 'nombre',
    orderDirection: 'asc',
  });

  const addUjier = async (data: Omit<Usuario, 'id'>) => {
    if (!data.nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    if (!data.password.trim()) {
      toast.error('La contraseña es requerida');
      return;
    }

    try {
      await addItem(data);
    } catch (err) {
      console.error('Error adding ujier:', err);
      throw err;
    }
  };

  const updateUjier = async (id: string, data: Partial<Usuario>) => {
    try {
      await updateItem(id, data);
    } catch (err) {
      console.error('Error updating ujier:', err);
      throw err;
    }
  };

  const deleteUjier = async (id: string) => {
    try {
      await deleteItem(id);
    } catch (err) {
      console.error('Error deleting ujier:', err);
      throw err;
    }
  };

  const getActiveUjieres = (): string[] => {
    return ujieres.filter((u) => u.activo).map((u) => u.nombre);
  };

  return {
    ujieres,
    loading,
    error,
    isAdding,
    isUpdating,
    isDeleting,
    addUjier,
    updateUjier,
    deleteUjier,
    refreshUjieres: refreshItems,
    getActiveUjieres,
  };
}
