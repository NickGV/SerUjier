import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { type Simpatizante } from '../types';

// Función para limpiar datos antes de enviar a Firebase
function cleanDataForFirebase<T extends Record<string, unknown>>(
  data: T
): Partial<T> {
  const cleaned: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null && value !== '') {
      cleaned[key] = value;
    }
  }

  return cleaned as Partial<T>;
}

export async function fetchSimpatizantes(): Promise<Simpatizante[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'simpatizantes'));

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Simpatizante[];
  } catch (error) {
    console.error('Error fetching simpatizantes:', error);
    throw error;
  }
}

export async function addSimpatizante(
  simpatizante: Omit<Simpatizante, 'id'>
): Promise<{ id: string }> {
  try {
    // Clean the data to remove undefined/empty values before sending to Firebase
    const cleanedData = cleanDataForFirebase(simpatizante);
    const docRef = await addDoc(collection(db, 'simpatizantes'), cleanedData);
    return { id: docRef.id };
  } catch (error) {
    console.error('Error adding simpatizante:', error);
    throw error;
  }
}

export async function updateSimpatizante(
  id: string,
  data: Partial<Omit<Simpatizante, 'id'>>
): Promise<void> {
  try {
    // Clean the data to remove undefined/empty values before sending to Firebase
    const cleanedData = cleanDataForFirebase(data);

    // Only proceed if there's actually data to update
    if (Object.keys(cleanedData).length === 0) {
      return;
    }

    const simpatizanteRef = doc(db, 'simpatizantes', id);
    await updateDoc(simpatizanteRef, cleanedData);
  } catch (error) {
    console.error('Error updating simpatizante:', error);
    throw error;
  }
}

export async function getSimpatizanteById(id: string): Promise<Simpatizante> {
  try {
    const simpatizanteRef = doc(db, 'simpatizantes', id);
    const simpatizanteSnap = await getDoc(simpatizanteRef);

    if (simpatizanteSnap.exists()) {
      return {
        id: simpatizanteSnap.id,
        ...simpatizanteSnap.data(),
      } as Simpatizante;
    } else {
      throw new Error('Simpatizante no encontrado');
    }
  } catch (error) {
    console.error('Error fetching simpatizante by id:', error);
    throw error;
  }
}

export async function deleteSimpatizante(id: string): Promise<void> {
  try {
    const simpatizanteRef = doc(db, 'simpatizantes', id);
    await deleteDoc(simpatizanteRef);
  } catch (error) {
    console.error('Error deleting simpatizante:', error);
    throw error;
  }
}
