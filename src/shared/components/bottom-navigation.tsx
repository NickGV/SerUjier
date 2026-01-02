'use client';

import { type User } from '@/shared/types';
import { Button } from '@/shared/ui/button';
import {
  Calculator,
  Clock,
  LogOut,
  Settings,
  UserCheck,
  Users,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
// TODO: Hacer el componente de BottomNavigation que aparezca dependiendo de los permisos del usuario, para ello debo crear un panel de permisos en el dashboard de admin

interface BottomNavigationProps {
  currentUser: User;
  onLogout: () => void;
}

export function BottomNavigation({
  currentUser,
  onLogout,
}: BottomNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();

  const adminNavItems = [
    // { id: "dashboard", label: "Inicio", icon: Home, description: "Panel principal", path: "/" },
    {
      id: 'conteo',
      label: 'Conteo',
      icon: Calculator,
      description: 'Registrar asistencia',
      path: '/conteo',
    },
    {
      id: 'simpatizantes',
      label: 'Simpatizantes',
      icon: Users,
      description: 'Gestionar visitantes',
      path: '/simpatizantes',
    },
    {
      id: 'miembros',
      label: 'Miembros',
      icon: UserCheck,
      description: 'Gestionar miembros',
      path: '/miembros',
    },
    {
      id: 'historial',
      label: 'Historial',
      icon: Clock,
      description: 'Ver registros',
      path: '/historial',
    },
    {
      id: 'ujieres',
      label: 'Gestión de Usuarios',
      icon: Settings,
      description: 'Gestionar usuarios',
      path: '/ujieres',
    },
  ];

  const directivaNavItems = [
    // { id: "dashboard", label: "Inicio", icon: Home, description: "Panel principal", path: "/" },
    {
      id: 'conteo',
      label: 'Conteo',
      icon: Calculator,
      description: 'Registrar asistencia',
      path: '/conteo',
    },
    {
      id: 'simpatizantes',
      label: 'Simpatizantes',
      icon: Users,
      description: 'Gestionar visitantes',
      path: '/simpatizantes',
    },
    {
      id: 'miembros',
      label: 'Miembros',
      icon: UserCheck,
      description: 'Gestionar miembros',
      path: '/miembros',
    },
    {
      id: 'historial',
      label: 'Historial',
      icon: Clock,
      description: 'Ver registros',
      path: '/historial',
    },
    {
      id: 'ujieres',
      label: 'Gestión de Usuarios',
      icon: Settings,
      description: 'Ver usuarios',
      path: '/ujieres',
    },
  ];

  const ujierNavItems = [
    {
      id: 'conteo',
      label: 'Conteo',
      icon: Calculator,
      description: 'Registrar asistencia',
      path: '/conteo',
    },
    {
      id: 'simpatizantes',
      label: 'Simpatizantes',
      icon: Users,
      description: 'Gestionar visitantes',
      path: '/simpatizantes',
    },
  ];

  const getNavItems = () => {
    switch (currentUser?.rol) {
      case 'admin':
        return adminNavItems;
      case 'directiva':
        return directivaNavItems;
      case 'ujier':
        return ujierNavItems;
      default:
        return ujierNavItems;
    }
  };

  const navItems = getNavItems();

  const getRoleColor = (rol: string) => {
    switch (rol) {
      case 'admin':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'directiva':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-green-50 text-green-700 border-green-200';
    }
  };

  const getRoleLabel = (rol: string) => {
    switch (rol) {
      case 'admin':
        return 'Administrador';
      case 'directiva':
        return 'Directiva';
      default:
        return 'Ujier';
    }
  };

  const isCurrentPath = (itemPath: string) => {
    if (itemPath === '/') {
      return pathname === '/' || pathname === '/dashboard';
    }
    return pathname.startsWith(itemPath);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg backdrop-blur-sm bg-white/95 z-50">
      {/* User Info */}
      <div className="px-3 py-2 md:px-4 md:py-3 border-b border-gray-100 bg-gray-50/90">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-900 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {currentUser?.nombre?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="text-sm md:text-base font-semibold text-gray-900">
                {currentUser?.nombre}
              </div>
              <div
                className={`text-[10px] md:text-xs px-1.5 py-0.5 rounded-full border ${getRoleColor(
                  currentUser?.rol
                )}`}
              >
                {getRoleLabel(currentUser?.rol)}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-gray-500 hover:text-red-600 hover:bg-red-50 p-1"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4 md:w-5 md:h-5" />
            <span className="ml-1 text-md">Salir</span>
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex safe-area-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isCurrentPath(item.path);

          return (
            <Button
              key={item.id}
              variant="ghost"
              className={`flex-1 flex flex-col items-center gap-1 h-16 md:h-20 rounded-none border-r border-gray-100 last:border-r-0 p-3 md:p-4 ${
                isActive
                  ? 'text-gray-900 bg-gray-100 border-t-2 border-t-gray-900'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => handleNavigation(item.path)}
              title={item.description}
            >
              <Icon className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-[11px] md:text-sm font-medium">
                {item.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
