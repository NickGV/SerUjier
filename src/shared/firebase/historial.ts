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
import { type MiembroSimplificado, type MiembrosAsistieron } from '../types';

export interface HistorialRecord {
  id: string;
  fecha: string;
  servicio: string;
  ujier: string | string[];
  hermanos: number;
  hermanas: number;
  ninos: number;
  adolescentes: number;
  simpatizantes: number;
  visitas?: number;
  heRestauracion?: number;
  hermanosVisitas?: number;
  total: number;
  simpatizantesAsistieron?: MiembroSimplificado[];
  visitasAsistieron?: MiembroSimplificado[];
  miembrosAsistieron?: MiembrosAsistieron;
  hermanosVisitasAsistieron?: Array<{
    id: string;
    nombre: string;
    iglesia?: string;
  }>;
}

export async function fetchHistorial(): Promise<HistorialRecord[]> {
  try {
    const q = query(collection(db, 'historial'), orderBy('fecha', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as HistorialRecord[];
  } catch (error) {
    console.error('Error fetching historial:', error);
    throw error;
  }
}

export async function saveConteo(
  conteoData: Omit<HistorialRecord, 'id'>
): Promise<{ id: string }> {
  try {
    const docRef = await addDoc(collection(db, 'historial'), conteoData);
    return { id: docRef.id };
  } catch (error) {
    console.error('Error saving conteo:', error);
    throw error;
  }
}

export async function updateHistorialRecord(
  id: string,
  data: Partial<HistorialRecord>
): Promise<void> {
  try {
    const historialRef = doc(db, 'historial', id);
    await updateDoc(historialRef, data);
  } catch (error) {
    console.error('Error updating historial record:', error);
    throw error;
  }
}

export async function deleteHistorialRecord(id: string): Promise<void> {
  try {
    const historialRef = doc(db, 'historial', id);
    await deleteDoc(historialRef);
  } catch (error) {
    console.error('Error deleting historial record:', error);
    throw error;
  }
}

export async function getHistorialRecordById(
  id: string
): Promise<HistorialRecord> {
  try {
    const historialRef = doc(db, 'historial', id);
    const historialSnap = await getDoc(historialRef);

    if (historialSnap.exists()) {
      return {
        id: historialSnap.id,
        ...historialSnap.data(),
      } as HistorialRecord;
    } else {
      throw new Error('Registro de historial no encontrado');
    }
  } catch (error) {
    console.error('Error fetching historial record by id:', error);
    throw error;
  }
}
