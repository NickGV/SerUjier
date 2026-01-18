import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Permission, UserPermissions } from '../types/permisos';

const COLLECTION_NAME = 'permisos';

/**
 * Obtiene los permisos personalizados de un usuario
 * @param userId - ID del usuario
 * @returns Los permisos del usuario o null si no tiene permisos personalizados
 */
export async function getPermisosUsuario(
  userId: string
): Promise<UserPermissions | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        userId: docSnap.id,
        ...docSnap.data(),
      } as UserPermissions;
    }

    return null;
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    throw error;
  }
}

/**
 * Establece los permisos de un usuario (reemplaza todos los permisos existentes)
 * @param userId - ID del usuario al que se le asignan permisos
 * @param permisos - Array de permisos a asignar
 * @param updatedBy - ID del usuario que realiza el cambio (debe ser admin)
 */
export async function setPermisosUsuario(
  userId: string,
  permisos: Permission[],
  updatedBy: string
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, userId);
    await setDoc(docRef, {
      userId,
      permisos,
      updatedAt: new Date().toISOString(),
      updatedBy,
    });
  } catch (error) {
    console.error('Error setting user permissions:', error);
    throw error;
  }
}

/**
 * Actualiza los permisos de un usuario (merge con existentes)
 * @param userId - ID del usuario
 * @param permisos - Array de permisos actualizados
 * @param updatedBy - ID del usuario que realiza el cambio
 */
export async function updatePermisosUsuario(
  userId: string,
  permisos: Permission[],
  updatedBy: string
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      await updateDoc(docRef, {
        permisos,
        updatedAt: new Date().toISOString(),
        updatedBy,
      });
    } else {
      // Si no existe, crear nuevo documento
      await setPermisosUsuario(userId, permisos, updatedBy);
    }
  } catch (error) {
    console.error('Error updating user permissions:', error);
    throw error;
  }
}

/**
 * Agrega un permiso específico a un usuario
 * @param userId - ID del usuario
 * @param permiso - Permiso a agregar
 * @param updatedBy - ID del usuario que realiza el cambio
 */
export async function addPermisoUsuario(
  userId: string,
  permiso: Permission,
  updatedBy: string
): Promise<void> {
  try {
    const currentPermisos = await getPermisosUsuario(userId);
    const permisos = currentPermisos?.permisos || [];

    if (!permisos.includes(permiso)) {
      permisos.push(permiso);
      await updatePermisosUsuario(userId, permisos, updatedBy);
    }
  } catch (error) {
    console.error('Error adding permission:', error);
    throw error;
  }
}

/**
 * Elimina un permiso específico de un usuario
 * @param userId - ID del usuario
 * @param permiso - Permiso a eliminar
 * @param updatedBy - ID del usuario que realiza el cambio
 */
export async function removePermisoUsuario(
  userId: string,
  permiso: Permission,
  updatedBy: string
): Promise<void> {
  try {
    const currentPermisos = await getPermisosUsuario(userId);
    const permisos = currentPermisos?.permisos || [];

    const filteredPermisos = permisos.filter((p) => p !== permiso);
    await updatePermisosUsuario(userId, filteredPermisos, updatedBy);
  } catch (error) {
    console.error('Error removing permission:', error);
    throw error;
  }
}

/**
 * Elimina todos los permisos de un usuario
 * @param userId - ID del usuario
 * @param updatedBy - ID del usuario que realiza el cambio
 */
export async function clearPermisosUsuario(
  userId: string,
  updatedBy: string
): Promise<void> {
  try {
    await setPermisosUsuario(userId, [], updatedBy);
  } catch (error) {
    console.error('Error clearing permissions:', error);
    throw error;
  }
}
