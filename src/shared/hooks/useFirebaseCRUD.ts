import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  type DocumentReference,
  type UpdateData,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { db } from '../lib/firebase';

// Tipo para las opciones de configuración del hook
export interface UseFirebaseCRUDOptions<_T> {
  collectionName: string;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
  onSuccess?: (message: string) => void;
  onError?: (error: Error) => void;
}

// Tipo para el retorno del hook
export interface UseFirebaseCRUDReturn<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  isAdding: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  addItem: (data: Omit<T, 'id'>) => Promise<void>;
  updateItem: (id: string, data: Partial<T>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  getItemById: (id: string) => Promise<T | null>;
  refreshItems: () => Promise<void>;
}

/**
 * Hook genérico para operaciones CRUD en Firebase
 * @param options Configuración del hook
 * @returns Funciones CRUD y estado
 */
export function useFirebaseCRUD<T extends { id: string }>(
  options: UseFirebaseCRUDOptions<T>
): UseFirebaseCRUDReturn<T> {
  const {
    collectionName,
    orderByField = 'nombre',
    orderDirection = 'asc',
    onSuccess,
    onError,
  } = options;

  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Función para limpiar datos antes de enviar a Firebase
  const cleanDataForFirebase = <U extends Record<string, unknown>>(
    data: U
  ): Partial<U> => {
    const cleaned: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null && value !== '') {
        cleaned[key] = value;
      }
    }

    return cleaned as Partial<U>;
  };

  // Cargar todos los documentos
  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const q = query(
        collection(db, collectionName),
        orderBy(orderByField, orderDirection)
      );
      const querySnapshot = await getDocs(q);

      const itemsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];

      setItems(itemsData);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : `Error cargando ${collectionName}`;
      setError(msg);
      toast.error(msg);
      onError?.(err instanceof Error ? err : new Error(msg));
    } finally {
      setLoading(false);
    }
  };

  // Agregar un nuevo documento
  const addItem = async (data: Omit<T, 'id'>) => {
    setIsAdding(true);
    try {
      const cleanedData = cleanDataForFirebase(data);
      const docRef = await addDoc(collection(db, collectionName), cleanedData);

      const newItem = {
        id: docRef.id,
        ...cleanedData,
      } as T;

      setItems([...items, newItem]);

      const message = `${collectionName.slice(0, -1)} agregado exitosamente`;
      toast.success(message);
      onSuccess?.(message);
    } catch (err) {
      const msg = `Error agregando ${collectionName.slice(0, -1)}`;
      setError(msg);
      toast.error(msg);
      onError?.(err instanceof Error ? err : new Error(msg));
      throw err;
    } finally {
      setIsAdding(false);
    }
  };

  // Actualizar un documento existente
  const updateItem = async (id: string, data: Partial<T>) => {
    setIsUpdating(true);
    try {
      const cleanedData = cleanDataForFirebase(data);

      if (Object.keys(cleanedData).length === 0) {
        return;
      }

      const docRef = doc(db, collectionName, id) as DocumentReference<
        Record<string, unknown>,
        Record<string, unknown>
      >;
      await updateDoc(docRef, cleanedData as UpdateData<T>);

      setItems(
        items.map((item) =>
          item.id === id ? { ...item, ...cleanedData } : item
        )
      );

      const message = `${collectionName.slice(0, -1)} actualizado exitosamente`;
      toast.success(message);
      onSuccess?.(message);
    } catch (err) {
      const msg = `Error actualizando ${collectionName.slice(0, -1)}`;
      setError(msg);
      toast.error(msg);
      onError?.(err instanceof Error ? err : new Error(msg));
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  // Eliminar un documento
  const deleteItem = async (id: string) => {
    setIsDeleting(true);
    try {
      const item = items.find((i) => i.id === id);
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);

      setItems(items.filter((item) => item.id !== id));

      const itemName =
        item && 'nombre' in item
          ? (item as Record<string, unknown>).nombre
          : '';
      const message = itemName
        ? `${itemName} eliminado exitosamente`
        : `${collectionName.slice(0, -1)} eliminado exitosamente`;

      toast.success(message);
      onSuccess?.(message);
    } catch (err) {
      const msg = `Error eliminando ${collectionName.slice(0, -1)}`;
      setError(msg);
      toast.error(msg);
      onError?.(err instanceof Error ? err : new Error(msg));
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  // Obtener un documento por ID
  const getItemById = async (id: string): Promise<T | null> => {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as T;
      } else {
        throw new Error(`${collectionName.slice(0, -1)} no encontrado`);
      }
    } catch (err) {
      const msg = `Error obteniendo ${collectionName.slice(0, -1)}`;
      toast.error(msg);
      onError?.(err instanceof Error ? err : new Error(msg));
      throw err;
    }
  };

  // Cargar items al montar el componente
  useEffect(() => {
    loadItems();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    items,
    loading,
    error,
    isAdding,
    isUpdating,
    isDeleting,
    addItem,
    updateItem,
    deleteItem,
    getItemById,
    refreshItems: loadItems,
  };
}
