'use client';

import { useUser } from '@/shared/contexts/user-context';
import { getPermisosUsuario } from '@/shared/firebase/permisos';
import {
  type Module,
  type Permission,
  ALL_PERMISSIONS,
  DEFAULT_ROLE_PERMISSIONS,
  isValidPermission,
} from '@/shared/types/permisos';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface UsePermisosReturn {
  // Estado
  permisos: Permission[];
  isLoading: boolean;
  error: string | null;

  // Verificaciones de permisos
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;

  // Helpers por módulo
  canView: (module: Module) => boolean;
  canCreate: (module: Module) => boolean;
  canEdit: (module: Module) => boolean;
  canDelete: (module: Module) => boolean;
  canActivate: (module: Module) => boolean;

  // Info del usuario
  isAdmin: boolean;
  userRole: string | undefined;

  // Refrescar permisos
  refreshPermisos: () => Promise<void>;
}

/**
 * Hook para gestionar y verificar permisos del usuario actual
 * Combina los permisos por defecto del rol con los permisos personalizados
 */
export function usePermisos(): UsePermisosReturn {
  const { user } = useUser();
  const [customPermisos, setCustomPermisos] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.rol === 'admin';

  // Cargar permisos personalizados del usuario
  const loadPermisos = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    // Si es admin, tiene todos los permisos automáticamente
    if (isAdmin) {
      setCustomPermisos([...ALL_PERMISSIONS]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const userPermisos = await getPermisosUsuario(user.id);

      if (
        userPermisos &&
        userPermisos.permisos &&
        userPermisos.permisos.length > 0
      ) {
        // Filtrar solo permisos válidos
        const validPermisos = userPermisos.permisos.filter(isValidPermission);
        setCustomPermisos(validPermisos);
      } else {
        // Si no tiene permisos personalizados, usar los del rol por defecto
        const rolePermisos =
          DEFAULT_ROLE_PERMISSIONS[
            user.rol as keyof typeof DEFAULT_ROLE_PERMISSIONS
          ] || [];
        setCustomPermisos(rolePermisos);
      }
    } catch (err) {
      setError('Error al cargar permisos');
      console.error('Error al cargar permisos:', err);
      // En caso de error, usar permisos del rol por defecto
      const rolePermisos =
        DEFAULT_ROLE_PERMISSIONS[
          user.rol as keyof typeof DEFAULT_ROLE_PERMISSIONS
        ] || [];
      setCustomPermisos(rolePermisos);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.rol, isAdmin]);

  useEffect(() => {
    loadPermisos();
  }, [loadPermisos]);

  // Combinar permisos del rol con permisos personalizados
  const permisos = useMemo(() => {
    if (!user) return [];

    // Admin siempre tiene todos los permisos
    if (isAdmin) {
      return [...ALL_PERMISSIONS];
    }

    // Para otros roles, usar los permisos personalizados
    // (que pueden incluir los del rol por defecto si no hay personalizados)
    return customPermisos;
  }, [user, isAdmin, customPermisos]);

  // Verificar si tiene un permiso específico
  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!user) return false;
      if (isAdmin) return true;
      const has = permisos.includes(permission);
      return has;
    },
    [user, isAdmin, permisos]
  );

  // Verificar si tiene al menos uno de los permisos
  const hasAnyPermission = useCallback(
    (permissions: Permission[]): boolean => {
      if (!user) return false;
      if (isAdmin) return true;
      return permissions.some((p) => permisos.includes(p));
    },
    [user, isAdmin, permisos]
  );

  // Verificar si tiene todos los permisos
  const hasAllPermissions = useCallback(
    (permissions: Permission[]): boolean => {
      if (!user) return false;
      if (isAdmin) return true;
      return permissions.every((p) => permisos.includes(p));
    },
    [user, isAdmin, permisos]
  );

  // Helpers para verificar permisos por acción
  const canView = useCallback(
    (module: Module): boolean => {
      return hasPermission(`${module}.view` as Permission);
    },
    [hasPermission]
  );

  const canCreate = useCallback(
    (module: Module): boolean => {
      return hasPermission(`${module}.create` as Permission);
    },
    [hasPermission]
  );

  const canEdit = useCallback(
    (module: Module): boolean => {
      return hasPermission(`${module}.edit` as Permission);
    },
    [hasPermission]
  );

  const canDelete = useCallback(
    (module: Module): boolean => {
      return hasPermission(`${module}.delete` as Permission);
    },
    [hasPermission]
  );

  const canActivate = useCallback(
    (module: Module): boolean => {
      // Solo el módulo usuarios tiene la acción activate
      if (module !== 'usuarios') return false;
      return hasPermission('usuarios.activate');
    },
    [hasPermission]
  );

  return {
    permisos,
    isLoading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canActivate,
    isAdmin,
    userRole: user?.rol,
    refreshPermisos: loadPermisos,
  };
}

/**
 * Hook simplificado para verificar un permiso específico
 * Útil cuando solo necesitas verificar un permiso
 */
export function useHasPermission(permission: Permission): boolean {
  const { hasPermission, isLoading } = usePermisos();

  if (isLoading) return false;
  return hasPermission(permission);
}

/**
 * Hook para verificar permisos de un módulo completo
 */
export function useModulePermissions(module: Module) {
  const {
    canView,
    canCreate,
    canEdit,
    canDelete,
    canActivate,
    isLoading,
    isAdmin,
  } = usePermisos();

  return {
    canView: canView(module),
    canCreate: canCreate(module),
    canEdit: canEdit(module),
    canDelete: canDelete(module),
    canActivate: module === 'usuarios' ? canActivate(module) : false,
    isLoading,
    isAdmin,
  };
}
