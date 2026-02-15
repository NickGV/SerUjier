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
import { type HeRestauracion } from '../types';

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

export async function fetchHeRestauracion(): Promise<HeRestauracion[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'heRestauracion'));

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as HeRestauracion[];
  } catch (error) {
    console.error('Error fetching heRestauracion:', error);
    throw error;
  }
}

export async function addHeRestauracion(
  heRestauracion: Omit<HeRestauracion, 'id'>
): Promise<{ id: string }> {
  try {
    // Clean the data to remove undefined/empty values before sending to Firebase
    const cleanedData = cleanDataForFirebase(heRestauracion);
    const docRef = await addDoc(collection(db, 'heRestauracion'), cleanedData);
    return { id: docRef.id };
  } catch (error) {
    console.error('Error adding heRestauracion:', error);
    throw error;
  }
}

export async function updateHeRestauracion(
  id: string,
  data: Partial<Omit<HeRestauracion, 'id'>>
): Promise<void> {
  try {
    // Clean the data to remove undefined/empty values before sending to Firebase
    const cleanedData = cleanDataForFirebase(data);

    // Only proceed if there's actually data to update
    if (Object.keys(cleanedData).length === 0) {
      return;
    }

    const heRestauracionRef = doc(db, 'heRestauracion', id);
    await updateDoc(heRestauracionRef, cleanedData);
  } catch (error) {
    console.error('Error updating heRestauracion:', error);
    throw error;
  }
}

export async function getHeRestauracionById(
  id: string
): Promise<HeRestauracion> {
  try {
    const heRestauracionRef = doc(db, 'heRestauracion', id);
    const heRestauracionSnap = await getDoc(heRestauracionRef);

    if (heRestauracionSnap.exists()) {
      return {
        id: heRestauracionSnap.id,
        ...heRestauracionSnap.data(),
      } as HeRestauracion;
    } else {
      throw new Error('HeRestauracion no encontrado');
    }
  } catch (error) {
    console.error('Error fetching heRestauracion by id:', error);
    throw error;
  }
}

export async function deleteHeRestauracion(id: string): Promise<void> {
  try {
    const heRestauracionRef = doc(db, 'heRestauracion', id);
    await deleteDoc(heRestauracionRef);
  } catch (error) {
    console.error('Error deleting heRestauracion:', error);
    throw error;
  }
}
