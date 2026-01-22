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
import { type Visita } from '../types';

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

export async function fetchVisitas(): Promise<Visita[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'visitas'));

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Visita[];
  } catch (error) {
    console.error('Error fetching visitas:', error);
    throw error;
  }
}

export async function addVisita(
  visita: Omit<Visita, 'id'>
): Promise<{ id: string }> {
  try {
    // Clean the data to remove undefined/empty values before sending to Firebase
    const cleanedData = cleanDataForFirebase(visita);
    const docRef = await addDoc(collection(db, 'visitas'), cleanedData);
    return { id: docRef.id };
  } catch (error) {
    console.error('Error adding visita:', error);
    throw error;
  }
}

export async function updateVisita(
  id: string,
  data: Partial<Omit<Visita, 'id'>>
): Promise<void> {
  try {
    // Clean the data to remove undefined/empty values before sending to Firebase
    const cleanedData = cleanDataForFirebase(data);

    // Only proceed if there's actually data to update
    if (Object.keys(cleanedData).length === 0) {
      return;
    }

    const visitaRef = doc(db, 'visitas', id);
    await updateDoc(visitaRef, cleanedData);
  } catch (error) {
    console.error('Error updating visita:', error);
    throw error;
  }
}

export async function getVisitaById(id: string): Promise<Visita> {
  try {
    const visitaRef = doc(db, 'visitas', id);
    const visitaSnap = await getDoc(visitaRef);

    if (visitaSnap.exists()) {
      return {
        id: visitaSnap.id,
        ...visitaSnap.data(),
      } as Visita;
    } else {
      throw new Error('Visita no encontrada');
    }
  } catch (error) {
    console.error('Error fetching visita by id:', error);
    throw error;
  }
}

export async function deleteVisita(id: string): Promise<void> {
  try {
    const visitaRef = doc(db, 'visitas', id);
    await deleteDoc(visitaRef);
  } catch (error) {
    console.error('Error deleting visita:', error);
    throw error;
  }
}
