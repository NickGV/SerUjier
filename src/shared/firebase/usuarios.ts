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
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Usuario {
  id: string;
  nombre: string;
  password: string;
  rol: 'admin' | 'directiva' | 'ujier';
  activo: boolean;
  fechaCreacion: string;
}

// Función para hashear contraseñas (mismo algoritmo que en la API de login)
export function hashPassword(password: string): string {
  const salt = 'ujier_salt_2025';
  // Usar btoa para compatibilidad con el navegador
  return btoa(password + salt);
}

export async function fetchUjieres(): Promise<Usuario[]> {
  try {
    const q = query(collection(db, 'usuarios'), orderBy('nombre', 'asc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Usuario[];
  } catch (error) {
    console.error('Error fetching ujieres:', error);
    throw error;
  }
}

export async function addUjier(
  ujier: Omit<Usuario, 'id'>
): Promise<{ id: string }> {
  try {
    // Hashear la contraseña antes de guardarla
    const ujierWithHashedPassword = {
      ...ujier,
      password: hashPassword(ujier.password),
    };

    const docRef = await addDoc(
      collection(db, 'usuarios'),
      ujierWithHashedPassword
    );
    return { id: docRef.id };
  } catch (error) {
    console.error('Error adding ujier:', error);
    throw error;
  }
}

export async function updateUjier(
  id: string,
  data: Partial<Omit<Usuario, 'id'>>
): Promise<void> {
  try {
    // Si se está actualizando la contraseña, hashearla
    const updateData = { ...data };
    if (updateData.password) {
      updateData.password = hashPassword(updateData.password);
    }

    const ujierRef = doc(db, 'usuarios', id);
    await updateDoc(ujierRef, updateData);
  } catch (error) {
    console.error('Error updating ujier:', error);
    throw error;
  }
}

export async function deleteUjier(id: string): Promise<void> {
  try {
    const ujierRef = doc(db, 'usuarios', id);
    await deleteDoc(ujierRef);
  } catch (error) {
    console.error('Error deleting ujier:', error);
    throw error;
  }
}

export async function getUjierById(id: string): Promise<Usuario> {
  try {
    const ujierRef = doc(db, 'usuarios', id);
    const ujierSnap = await getDoc(ujierRef);

    if (ujierSnap.exists()) {
      return {
        id: ujierSnap.id,
        ...ujierSnap.data(),
      } as Usuario;
    } else {
      throw new Error('Usuario no encontrado');
    }
  } catch (error) {
    console.error('Error fetching ujier by id:', error);
    throw error;
  }
}
