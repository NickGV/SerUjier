// Definición de todos los permisos disponibles en el sistema
// Formato: modulo.accion

export const MODULES = [
  'simpatizantes',
  'visitas',
  'miembros',
  'historial',
  'usuarios',
] as const;
export type Module = (typeof MODULES)[number];

export const ACTIONS = [
  'view',
  'create',
  'edit',
  'delete',
  'activate',
] as const;
export type Action = (typeof ACTIONS)[number];

// Todos los permisos posibles
export const ALL_PERMISSIONS = [
  // Simpatizantes
  'simpatizantes.view',
  'simpatizantes.create',
  'simpatizantes.edit',
  'simpatizantes.delete',
  // Visitas
  'visitas.view',
  'visitas.create',
  'visitas.edit',
  'visitas.delete',
  // Miembros
  'miembros.view',
  'miembros.create',
  'miembros.edit',
  'miembros.delete',
  // Historial
  'historial.view',
  'historial.delete',
  // Usuarios
  'usuarios.view',
  'usuarios.create',
  'usuarios.edit',
  'usuarios.delete',
  'usuarios.activate',
] as const;

export type Permission = (typeof ALL_PERMISSIONS)[number];

// Agrupación de permisos por módulo para mostrar en UI
export const PERMISSIONS_BY_MODULE: Record<
  Module,
  { permission: Permission; label: string }[]
> = {
  simpatizantes: [
    { permission: 'simpatizantes.view', label: 'Ver simpatizantes' },
    { permission: 'simpatizantes.create', label: 'Crear simpatizantes' },
    { permission: 'simpatizantes.edit', label: 'Editar simpatizantes' },
    { permission: 'simpatizantes.delete', label: 'Eliminar simpatizantes' },
  ],
  visitas: [
    { permission: 'visitas.view', label: 'Ver visitas' },
    { permission: 'visitas.create', label: 'Crear visitas' },
    { permission: 'visitas.edit', label: 'Editar visitas' },
    { permission: 'visitas.delete', label: 'Eliminar visitas' },
  ],
  miembros: [
    { permission: 'miembros.view', label: 'Ver miembros' },
    { permission: 'miembros.create', label: 'Crear miembros' },
    { permission: 'miembros.edit', label: 'Editar miembros' },
    { permission: 'miembros.delete', label: 'Eliminar miembros' },
  ],
  historial: [
    { permission: 'historial.view', label: 'Ver historial' },
    {
      permission: 'historial.delete',
      label: 'Eliminar registros del historial',
    },
  ],
  usuarios: [
    { permission: 'usuarios.view', label: 'Ver usuarios' },
    { permission: 'usuarios.create', label: 'Crear usuarios' },
    { permission: 'usuarios.edit', label: 'Editar usuarios' },
    { permission: 'usuarios.delete', label: 'Eliminar usuarios' },
    { permission: 'usuarios.activate', label: 'Activar/desactivar usuarios' },
  ],
};

// Labels para los módulos
export const MODULE_LABELS: Record<Module, string> = {
  simpatizantes: 'Simpatizantes',
  visitas: 'Visitas',
  miembros: 'Miembros',
  historial: 'Historial',
  usuarios: 'Usuarios',
};

// Permisos por defecto para cada rol (vacíos, el admin los configura)
// El admin siempre tiene todos los permisos automáticamente
export type UserRole = 'admin' | 'directiva' | 'ujier';

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [...ALL_PERMISSIONS], // Admin siempre tiene todos los permisos
  directiva: [], // Configurable por el admin
  ujier: [], // Configurable por el admin
};

// Interface para los permisos guardados en Firebase
export interface UserPermissions {
  userId: string;
  permisos: Permission[];
  updatedAt: string;
  updatedBy: string;
}

// Helper para verificar si un permiso es válido
export function isValidPermission(
  permission: string
): permission is Permission {
  return ALL_PERMISSIONS.includes(permission as Permission);
}

// Helper para obtener el módulo de un permiso
export function getModuleFromPermission(permission: Permission): Module {
  return permission.split('.')[0] as Module;
}

// Helper para obtener la acción de un permiso
export function getActionFromPermission(permission: Permission): Action {
  return permission.split('.')[1] as Action;
}
