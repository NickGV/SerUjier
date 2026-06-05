import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import type { Amigo } from '@/types/amigos';

// Helper to clean data before sending to Firebase
export function cleanDataForFirebase<T extends Record<string, unknown>>(
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

export async function fetchAmigos(): Promise<Amigo[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'amigos'));

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Amigo[];
  } catch (error) {
    console.error('Error fetching amigos:', error);
    throw error;
  }
}

export async function addAmigo(
  amigo: Omit<Amigo, 'id'>
): Promise<{ id: string }> {
  try {
    const cleanedData = cleanDataForFirebase(amigo);
    const docRef = await addDoc(collection(db, 'amigos'), cleanedData);
    return { id: docRef.id };
  } catch (error) {
    console.error('Error adding amigo:', error);
    throw error;
  }
}

export async function updateAmigo(
  id: string,
  data: Partial<Omit<Amigo, 'id'>>
): Promise<void> {
  try {
    const cleanedData = cleanDataForFirebase(data);

    if (Object.keys(cleanedData).length === 0) {
      return;
    }

    const amigoRef = doc(db, 'amigos', id);
    await updateDoc(amigoRef, cleanedData);
  } catch (error) {
    console.error('Error updating amigo:', error);
    throw error;
  }
}

export async function getAmigoById(id: string): Promise<Amigo> {
  try {
    const amigoRef = doc(db, 'amigos', id);
    const amigoSnap = await getDoc(amigoRef);

    if (amigoSnap.exists()) {
      return {
        id: amigoSnap.id,
        ...amigoSnap.data(),
      } as Amigo;
    } else {
      throw new Error('Amigo no encontrado');
    }
  } catch (error) {
    console.error('Error fetching amigo by id:', error);
    throw error;
  }
}

export async function deleteAmigo(id: string): Promise<void> {
  try {
    const amigoRef = doc(db, 'amigos', id);
    await deleteDoc(amigoRef);
  } catch (error) {
    console.error('Error deleting amigo:', error);
    throw error;
  }
}
