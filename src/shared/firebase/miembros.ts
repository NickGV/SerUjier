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
import { type Miembro } from '../types';

export async function fetchMiembros(): Promise<Miembro[]> {
  try {
    const q = query(collection(db, 'miembros'), orderBy('nombre', 'asc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Miembro[];
  } catch (error) {
    console.error('Error fetching miembros:', error);
    throw error;
  }
}

export async function addMiembro(
  miembro: Omit<Miembro, 'id'>
): Promise<{ id: string }> {
  try {
    const docRef = await addDoc(collection(db, 'miembros'), miembro);
    return { id: docRef.id };
  } catch (error) {
    console.error('Error adding miembro:', error);
    throw error;
  }
}

export async function updateMiembro(
  id: string,
  data: Partial<Omit<Miembro, 'id'>>
): Promise<void> {
  try {
    const miembroRef = doc(db, 'miembros', id);
    await updateDoc(miembroRef, data);
  } catch (error) {
    console.error('Error updating miembro:', error);
    throw error;
  }
}

export async function getMiembroById(id: string): Promise<Miembro> {
  try {
    const miembroRef = doc(db, 'miembros', id);
    const miembroSnap = await getDoc(miembroRef);

    if (miembroSnap.exists()) {
      return {
        id: miembroSnap.id,
        ...miembroSnap.data(),
      } as Miembro;
    } else {
      throw new Error('Miembro no encontrado');
    }
  } catch (error) {
    console.error('Error fetching miembro by id:', error);
    throw error;
  }
}

export async function deleteMiembro(id: string): Promise<void> {
  try {
    const miembroRef = doc(db, 'miembros', id);
    await deleteDoc(miembroRef);
  } catch (error) {
    console.error('Error deleting miembro:', error);
    throw error;
  }
}
