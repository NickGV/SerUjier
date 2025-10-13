import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  collection,
  getDocs,
  orderBy,
  query,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";

// Función para hashear contraseñas (mismo algoritmo que en la API de login)
export function hashPassword(password: string): string {
  const salt = "ujier_salt_2025";
  // Usar btoa para compatibilidad con el navegador
  return btoa(password + salt);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Placeholder data fetchers. Replace with Firestore queries using db from lib/firebase.
export async function fetchSimpatizantes() {
  try {
    const querySnapshot = await getDocs(collection(db, "simpatizantes"));

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Array<{
      id: string;
      nombre: string;
      telefono?: string;
      notas?: string;
      fechaRegistro: string;
    }>;
  } catch (error) {
    console.error("Error fetching simpatizantes:", error);
    throw error;
  }
}

export async function addSimpatizante(simpatizante: {
  nombre: string;
  telefono?: string;
  notas?: string;
  fechaRegistro: string;
}) {
  try {
    const docRef = await addDoc(collection(db, "simpatizantes"), simpatizante);
    console.log("Simpatizante creado exitosamente:", simpatizante.nombre);
    return { id: docRef.id };
  } catch (error) {
    console.error("Error adding simpatizante:", error);
    throw error;
  }
}

export async function fetchMiembros() {
  try {
    const q = query(collection(db, "miembros"), orderBy("nombre", "asc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Array<{
      id: string;
      nombre: string;
      telefono?: string;
      categoria: "hermano" | "hermana" | "nino" | "adolescente";
      notas?: string;
      fechaRegistro: string;
    }>;
  } catch (error) {
    console.error("Error fetching miembros:", error);
    throw error;
  }
}

export async function addMiembro(miembro: {
  nombre: string;
  telefono?: string;
  categoria: "hermano" | "hermana" | "nino" | "adolescente";
  notas?: string;
  fechaRegistro: string;
}) {
  try {
    const docRef = await addDoc(collection(db, "miembros"), miembro);
    console.log("Miembro creado exitosamente:", miembro.nombre);
    return { id: docRef.id };
  } catch (error) {
    console.error("Error adding miembro:", error);
    throw error;
  }
}

export async function updateMiembro(
  id: string,
  data: Partial<{
    nombre: string;
    telefono?: string;
    categoria: "hermano" | "hermana" | "nino" | "adolescente";
    notas?: string;
  }>
) {
  try {
    const miembroRef = doc(db, "miembros", id);
    await updateDoc(miembroRef, data);
    console.log("Miembro actualizado exitosamente:", id);
  } catch (error) {
    console.error("Error updating miembro:", error);
    throw error;
  }
}

export async function deleteMiembro(id: string) {
  try {
    const miembroRef = doc(db, "miembros", id);
    await deleteDoc(miembroRef);
    console.log("Miembro eliminado exitosamente:", id);
  } catch (error) {
    console.error("Error deleting miembro:", error);
    throw error;
  }
}

export async function getMiembroById(id: string) {
  try {
    const miembroRef = doc(db, "miembros", id);
    const miembroSnap = await getDoc(miembroRef);

    if (miembroSnap.exists()) {
      return {
        id: miembroSnap.id,
        ...miembroSnap.data(),
      } as {
        id: string;
        nombre: string;
        telefono?: string;
        categoria: "hermano" | "hermana" | "nino" | "adolescente";
        notas?: string;
        fechaRegistro: string;
      };
    } else {
      throw new Error("Miembro no encontrado");
    }
  } catch (error) {
    console.error("Error fetching miembro by id:", error);
    throw error;
  }
}

export async function fetchUjieres() {
  try {
    const q = query(collection(db, "usuarios"), orderBy("nombre", "asc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Array<{
      id: string;
      nombre: string;
      password: string;
      rol: "admin" | "directiva" | "ujier";
      activo: boolean;
      fechaCreacion: string;
    }>;
  } catch (error) {
    console.error("Error fetching ujieres:", error);
    throw error;
  }
}

export async function addUjier(ujier: {
  nombre: string;
  password: string;
  rol: "admin" | "directiva" | "ujier";
  activo: boolean;
  fechaCreacion: string;
}) {
  try {
    // Hashear la contraseña antes de guardarla
    const ujierWithHashedPassword = {
      ...ujier,
      password: hashPassword(ujier.password),
    };

    const docRef = await addDoc(
      collection(db, "usuarios"),
      ujierWithHashedPassword
    );
    console.log("Usuario creado exitosamente:", ujier.nombre);
    return { id: docRef.id };
  } catch (error) {
    console.error("Error adding ujier:", error);
    throw error;
  }
}

export async function updateUjier(
  id: string,
  data: Partial<{
    nombre: string;
    password: string;
    rol: "admin" | "directiva" | "ujier";
    activo: boolean;
  }>
) {
  try {
    // Si se está actualizando la contraseña, hashearla
    const updateData = { ...data };
    if (updateData.password) {
      updateData.password = hashPassword(updateData.password);
    }

    const ujierRef = doc(db, "usuarios", id);
    await updateDoc(ujierRef, updateData);

    console.log("Usuario actualizado exitosamente:", id);
  } catch (error) {
    console.error("Error updating ujier:", error);
    throw error;
  }
}

export async function deleteUjier(id: string) {
  try {
    const ujierRef = doc(db, "usuarios", id);
    await deleteDoc(ujierRef);
    console.log("Usuario eliminado exitosamente:", id);
  } catch (error) {
    console.error("Error deleting ujier:", error);
    throw error;
  }
}

export async function getUjierById(id: string) {
  try {
    const ujierRef = doc(db, "usuarios", id);
    const ujierSnap = await getDoc(ujierRef);

    if (ujierSnap.exists()) {
      return {
        id: ujierSnap.id,
        ...ujierSnap.data(),
      } as {
        id: string;
        nombre: string;
        password: string;
        rol: "admin" | "directiva" | "ujier";
        activo: boolean;
        fechaCreacion: string;
      };
    } else {
      throw new Error("Usuario no encontrado");
    }
  } catch (error) {
    console.error("Error fetching ujier by id:", error);
    throw error;
  }
}

export async function updateSimpatizante(
  id: string,
  data: Partial<{
    nombre: string;
    telefono?: string;
    notas?: string;
  }>
) {
  try {
    const simpatizanteRef = doc(db, "simpatizantes", id);
    await updateDoc(simpatizanteRef, data);

    console.log("Simpatizante actualizado exitosamente:", id);
  } catch (error) {
    console.error("Error updating simpatizante:", error);
    throw error;
  }
}

export async function getSimpatizanteById(id: string) {
  try {
    const simpatizanteRef = doc(db, "simpatizantes", id);
    const simpatizanteSnap = await getDoc(simpatizanteRef);

    if (simpatizanteSnap.exists()) {
      return {
        id: simpatizanteSnap.id,
        ...simpatizanteSnap.data(),
      } as {
        id: string;
        nombre: string;
        telefono?: string;
        notas?: string;
        fechaRegistro: string;
      };
    } else {
      throw new Error("Simpatizante no encontrado");
    }
  } catch (error) {
    console.error("Error fetching simpatizante by id:", error);
    throw error;
  }
}

export async function deleteSimpatizante(id: string) {
  try {
    const simpatizanteRef = doc(db, "simpatizantes", id);
    await deleteDoc(simpatizanteRef);

    console.log("Simpatizante eliminado exitosamente:", id);
  } catch (error) {
    console.error("Error deleting simpatizante:", error);
    throw error;
  }
}

export async function fetchHistorial() {
  try {
    const q = query(collection(db, "historial"), orderBy("fecha", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Array<{
      id: string;
      fecha: string;
      servicio: string;
      ujier: string | string[];
      hermanos: number;
      hermanas: number;
      ninos: number;
      adolescentes: number;
      simpatizantes: number;
      hermanosApartados?: number;
      hermanosVisitas?: number;
      total: number;
      simpatizantesAsistieron?: Array<{ id: string; nombre: string }>;
      miembrosAsistieron?: {
        hermanos?: Array<{ id: string; nombre: string }>;
        hermanas?: Array<{ id: string; nombre: string }>;
        ninos?: Array<{ id: string; nombre: string }>;
        adolescentes?: Array<{ id: string; nombre: string }>;
        hermanosApartados?: Array<{ id: string; nombre: string }>;
      };
      hermanosVisitasAsistieron?: Array<{ id: string; nombre: string }>;
    }>;
  } catch (error) {
    console.error("Error fetching historial:", error);
    throw error;
  }
}

export async function saveConteo(conteoData: {
  fecha: string;
  servicio: string;
  ujier: string[];
  hermanos: number;
  hermanas: number;
  ninos: number;
  adolescentes: number;
  simpatizantes: number;
  hermanosApartados?: number;
  hermanosVisitas?: number;
  total: number;
  simpatizantesAsistieron?: Array<{ id: string; nombre: string }>;
  miembrosAsistieron?: {
    hermanos?: Array<{ id: string; nombre: string }>;
    hermanas?: Array<{ id: string; nombre: string }>;
    ninos?: Array<{ id: string; nombre: string }>;
    adolescentes?: Array<{ id: string; nombre: string }>;
    hermanosApartados?: Array<{ id: string; nombre: string }>;
  };
  hermanosVisitasAsistieron?: Array<{ id: string; nombre: string }>;
}) {
  try {
    const docRef = await addDoc(collection(db, "historial"), conteoData);
    console.log("Conteo guardado exitosamente con ID:", docRef.id);
    return { id: docRef.id };
  } catch (error) {
    console.error("Error saving conteo:", error);
    throw error;
  }
}

export async function updateHistorialRecord(
  id: string,
  data: Partial<{
    fecha: string;
    servicio: string;
    ujier: string[];
    hermanos: number;
    hermanas: number;
    ninos: number;
    adolescentes: number;
    simpatizantes: number;
    hermanosApartados?: number;
    hermanosVisitas?: number;
    total: number;
    simpatizantesAsistieron?: Array<{ id: string; nombre: string }>;
    miembrosAsistieron?: {
      hermanos?: Array<{ id: string; nombre: string }>;
      hermanas?: Array<{ id: string; nombre: string }>;
      ninos?: Array<{ id: string; nombre: string }>;
      adolescentes?: Array<{ id: string; nombre: string }>;
      hermanosApartados?: Array<{ id: string; nombre: string }>;
    };
    hermanosVisitasAsistieron?: Array<{ id: string; nombre: string }>;
  }>
) {
  try {
    const historialRef = doc(db, "historial", id);
    await updateDoc(historialRef, data);
    console.log("Registro de historial actualizado exitosamente:", id);
  } catch (error) {
    console.error("Error updating historial record:", error);
    throw error;
  }
}

export async function deleteHistorialRecord(id: string) {
  try {
    const historialRef = doc(db, "historial", id);
    await deleteDoc(historialRef);
    console.log("Registro de historial eliminado exitosamente:", id);
  } catch (error) {
    console.error("Error deleting historial record:", error);
    throw error;
  }
}

export async function getHistorialRecordById(id: string) {
  try {
    const historialRef = doc(db, "historial", id);
    const historialSnap = await getDoc(historialRef);

    if (historialSnap.exists()) {
      return {
        id: historialSnap.id,
        ...historialSnap.data(),
      } as {
        id: string;
        fecha: string;
        servicio: string;
        ujier: string | string[];
        hermanos: number;
        hermanas: number;
        ninos: number;
        adolescentes: number;
        simpatizantes: number;
        hermanosApartados?: number;
        hermanosVisitas?: number;
        total: number;
        simpatizantesAsistieron?: Array<{ id: string; nombre: string }>;
        miembrosAsistieron?: {
          hermanos?: Array<{ id: string; nombre: string }>;
          hermanas?: Array<{ id: string; nombre: string }>;
          ninos?: Array<{ id: string; nombre: string }>;
          adolescentes?: Array<{ id: string; nombre: string }>;
          hermanosApartados?: Array<{ id: string; nombre: string }>;
        };
        hermanosVisitasAsistieron?: Array<{ id: string; nombre: string }>;
      };
    } else {
      throw new Error("Registro de historial no encontrado");
    }
  } catch (error) {
    console.error("Error fetching historial record by id:", error);
    throw error;
  }
}
