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
import { type Miembro, type MiembroInput } from '../types';

// Single read boundary for miembros documents. Missing, null, or
// non-boolean `esMiembro` values default to `false` — the only place
// that default is applied (no scattered `?? false` in UI code).
export function normalizeMiembro(
  id: string,
  data: Record<string, unknown>
): Miembro {
  return { ...data, id, esMiembro: data.esMiembro === true } as Miembro;
}

export async function fetchMiembros(): Promise<Miembro[]> {
  try {
    const q = query(collection(db, 'miembros'), orderBy('nombre', 'asc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) =>
      normalizeMiembro(doc.id, doc.data())
    );
  } catch (error) {
    console.error('Error fetching miembros:', error);
    throw error;
  }
}

export async function addMiembro(
  miembro: MiembroInput
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
  data: Partial<MiembroInput>
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
      return normalizeMiembro(miembroSnap.id, miembroSnap.data());
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
