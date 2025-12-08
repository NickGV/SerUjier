'use client';

import React from 'react';
import { useUser } from '@/shared/contexts/user-context';
import { Card, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Shield, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

type AllowedRole = 'admin' | 'directiva' | 'ujier';
type ProtectedRoute =
  | 'conteo'
  | 'simpatizantes'
  | 'historial'
  | 'ujieres'
  | 'configuracion';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: AllowedRole[];
  route?: ProtectedRoute;
  fallback?: React.ReactNode;
}

// Definir qué roles pueden acceder a qué rutas
const ROUTE_PERMISSIONS: Record<ProtectedRoute, AllowedRole[]> = {
  conteo: ['admin', 'directiva', 'ujier'],
  simpatizantes: ['admin', 'directiva', 'ujier'],
  historial: ['admin', 'directiva'],
  ujieres: ['admin', 'directiva'],
  configuracion: ['admin', 'directiva'],
};

export function RoleGuard({
  children,
  allowedRoles,
  route,
  fallback,
}: RoleGuardProps) {
  const { user, isLoading } = useUser();
  const router = useRouter();

  // Si está cargando, mostrar spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4" />
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, redirigir al login
  if (!user) {
    router.push('/login');
    return null;
  }

  // Determinar roles permitidos
  let effectiveAllowedRoles = allowedRoles;
  if (route && ROUTE_PERMISSIONS[route]) {
    effectiveAllowedRoles = ROUTE_PERMISSIONS[route];
  }

  // Verificar si el usuario tiene permisos
  const hasPermission = effectiveAllowedRoles.includes(user.rol);

  if (!hasPermission) {
    // Mostrar fallback personalizado o mensaje por defecto
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <Shield className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Acceso Denegado
            </h2>
            <p className="text-gray-600 mb-4">
              No tienes permisos para acceder a esta sección.
            </p>
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Tu rol actual:</span>
                <span className="capitalize font-semibold">
                  {user.rol === 'admin'
                    ? 'Administrador'
                    : user.rol === 'directiva'
                      ? 'Directiva'
                      : 'Ujier'}
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500 mb-4">
              <p className="font-medium mb-2">Permisos por rol:</p>
              <div className="text-left space-y-1">
                <p>
                  <span className="font-medium">Ujier:</span> Conteo y
                  Simpatizantes
                </p>
                <p>
                  <span className="font-medium">Directiva:</span> Conteo,
                  Simpatizantes, Historial y Configuración
                </p>
                <p>
                  <span className="font-medium">Admin:</span> Acceso completo
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="flex-1"
              >
                Volver
              </Button>
              <Button
                onClick={() => router.push('/')}
                className="flex-1 bg-slate-600 hover:bg-slate-700"
              >
                Ir al Inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si tiene permisos, mostrar el contenido
  return <>{children}</>;
}

// Hook para verificar permisos en componentes
export function useRolePermissions() {
  const { user } = useUser();

  const hasRole = (role: AllowedRole) => user?.rol === role;

  const canAccess = (route: ProtectedRoute) => {
    if (!user) return false;
    return ROUTE_PERMISSIONS[route].includes(user.rol);
  };

  const isAdmin = () => user?.rol === 'admin';
  const isDirectiva = () => user?.rol === 'directiva';
  const isUjier = () => user?.rol === 'ujier';

  return {
    user,
    hasRole,
    canAccess,
    isAdmin,
    isDirectiva,
    isUjier,
    // Permisos específicos comunes
    canManageUsers: user?.rol === 'admin',
    canViewHistory: user?.rol === 'admin' || user?.rol === 'directiva',
    canModifyUjieres: user?.rol === 'admin' || user?.rol === 'directiva',
    canOnlyCount: user?.rol === 'ujier',
  };
}
