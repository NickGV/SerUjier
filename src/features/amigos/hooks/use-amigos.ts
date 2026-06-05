'use client';

import { useFirebaseCRUD } from '@/shared/hooks';
import { type Amigo } from '@/types/amigos';
import { toast } from 'sonner';

interface UseAmigosReturn {
  amigos: Amigo[];
  loading: boolean;
  error: string | null;
  isAdding: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  addAmigo: (
    data: Omit<Amigo, 'id' | 'fechaRegistro'> & { nombre: string }
  ) => Promise<void>;
  updateAmigo: (
    id: string,
    data: Partial<Omit<Amigo, 'id' | 'fechaRegistro'>>
  ) => Promise<void>;
  deleteAmigo: (id: string) => Promise<void>;
  refreshAmigos: () => Promise<void>;
}

/**
 * Custom hook for managing amigos using useFirebaseCRUD
 * Handles loading, CRUD operations, and toast notifications
 */
export function useAmigos(): UseAmigosReturn {
  const {
    items: amigos,
    loading,
    error,
    isAdding,
    isUpdating,
    isDeleting,
    addItem,
    updateItem,
    deleteItem,
    refreshItems,
  } = useFirebaseCRUD<Amigo>({
    collectionName: 'amigos',
  });

  const addAmigo = async (
    data: Omit<Amigo, 'id' | 'fechaRegistro'> & { nombre: string }
  ) => {
    if (!data.nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    try {
      const nuevoAmigo = {
        ...data,
        fechaRegistro: new Date().toISOString(),
      };
      await addItem(nuevoAmigo);
    } catch (err) {
      console.error('Error adding amigo:', err);
      throw err;
    }
  };

  const updateAmigo = async (
    id: string,
    data: Partial<Omit<Amigo, 'id' | 'fechaRegistro'>>
  ) => {
    try {
      await updateItem(id, data);
    } catch (err) {
      console.error('Error updating amigo:', err);
      throw err;
    }
  };

  const deleteAmigo = async (id: string) => {
    try {
      await deleteItem(id);
    } catch (err) {
      console.error('Error deleting amigo:', err);
      throw err;
    }
  };

  return {
    amigos,
    loading,
    error,
    isAdding,
    isUpdating,
    isDeleting,
    addAmigo,
    updateAmigo,
    deleteAmigo,
    refreshAmigos: refreshItems,
  };
}
