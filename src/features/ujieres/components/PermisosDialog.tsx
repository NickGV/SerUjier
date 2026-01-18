'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { Label } from '@/shared/ui/label';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Shield, Save, X, Loader2, Check, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import {
  type Permission,
  type Module,
  MODULES,
  PERMISSIONS_BY_MODULE,
  MODULE_LABELS,
  ALL_PERMISSIONS,
} from '@/shared/types/permisos';
import {
  getPermisosUsuario,
  setPermisosUsuario,
} from '@/shared/firebase/permisos';

interface Usuario {
  id: string;
  nombre: string;
  rol: 'admin' | 'directiva' | 'ujier';
  activo: boolean;
}

interface PermisosDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: Usuario | null;
  currentUserId: string; // ID del admin que está haciendo cambios
  onPermisosUpdated?: () => void;
}

export function PermisosDialog({
  open,
  onOpenChange,
  usuario,
  currentUserId,
  onPermisosUpdated,
}: PermisosDialogProps) {
  const [selectedPermisos, setSelectedPermisos] = useState<Set<Permission>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalPermisos, setOriginalPermisos] = useState<Set<Permission>>(
    new Set()
  );

  // Cargar permisos actuales del usuario
  useEffect(() => {
    if (open && usuario) {
      loadPermisos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, usuario?.id]);

  const loadPermisos = async () => {
    if (!usuario) return;

    setIsLoading(true);
    try {
      const userPermisos = await getPermisosUsuario(usuario.id);
      const permisos = new Set<Permission>(userPermisos?.permisos || []);
      setSelectedPermisos(permisos);
      setOriginalPermisos(new Set(permisos));
      setHasChanges(false);
    } catch (error) {
      console.error('Error loading permissions:', error);
      toast.error('Error al cargar los permisos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePermiso = (permiso: Permission) => {
    const newPermisos = new Set(selectedPermisos);
    if (newPermisos.has(permiso)) {
      newPermisos.delete(permiso);
    } else {
      newPermisos.add(permiso);
    }
    setSelectedPermisos(newPermisos);

    // Verificar si hay cambios
    const hasChanges =
      newPermisos.size !== originalPermisos.size ||
      ![...newPermisos].every((p) => originalPermisos.has(p));
    setHasChanges(hasChanges);
  };

  const handleToggleModulo = (module: Module) => {
    const modulePermisos = PERMISSIONS_BY_MODULE[module].map(
      (p) => p.permission
    );
    const allSelected = modulePermisos.every((p) => selectedPermisos.has(p));

    const newPermisos = new Set(selectedPermisos);
    if (allSelected) {
      // Deseleccionar todos los permisos del módulo
      modulePermisos.forEach((p) => newPermisos.delete(p));
    } else {
      // Seleccionar todos los permisos del módulo
      modulePermisos.forEach((p) => newPermisos.add(p));
    }
    setSelectedPermisos(newPermisos);

    // Verificar si hay cambios
    const hasChanges =
      newPermisos.size !== originalPermisos.size ||
      ![...newPermisos].every((p) => originalPermisos.has(p));
    setHasChanges(hasChanges);
  };

  const handleSelectAll = () => {
    const newPermisos = new Set<Permission>(ALL_PERMISSIONS);
    setSelectedPermisos(newPermisos);
    setHasChanges(true);
  };

  const handleDeselectAll = () => {
    setSelectedPermisos(new Set());
    setHasChanges(originalPermisos.size > 0);
  };

  const handleSave = async () => {
    if (!usuario) return;

    setIsSaving(true);
    try {
      await setPermisosUsuario(
        usuario.id,
        [...selectedPermisos],
        currentUserId
      );
      setOriginalPermisos(new Set(selectedPermisos));
      setHasChanges(false);
      toast.success('Permisos guardados exitosamente');
      onPermisosUpdated?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast.error('Error al guardar los permisos');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      if (
        !confirm(
          '¿Estás seguro de que deseas cerrar? Los cambios no guardados se perderán.'
        )
      ) {
        return;
      }
    }
    onOpenChange(false);
  };

  const getModuleCheckState = (
    module: Module
  ): 'checked' | 'unchecked' | 'indeterminate' => {
    const modulePermisos = PERMISSIONS_BY_MODULE[module].map(
      (p) => p.permission
    );
    const selectedCount = modulePermisos.filter((p) =>
      selectedPermisos.has(p)
    ).length;

    if (selectedCount === 0) return 'unchecked';
    if (selectedCount === modulePermisos.length) return 'checked';
    return 'indeterminate';
  };

  if (!usuario) return null;

  const isAdminUser = usuario.rol === 'admin';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-slate-600" />
            Gestionar Permisos
          </DialogTitle>
          <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
            <span>
              Configura los permisos para{' '}
              <span className="font-semibold">{usuario.nombre}</span>
            </span>
            <Badge variant="outline">
              {usuario.rol === 'admin'
                ? 'Administrador'
                : usuario.rol === 'directiva'
                  ? 'Directiva'
                  : 'Ujier'}
            </Badge>
          </div>
        </DialogHeader>

        {isAdminUser ? (
          <div className="py-6">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">
                      Usuario Administrador
                    </p>
                    <p className="text-sm text-blue-700">
                      Los administradores tienen automáticamente todos los
                      permisos del sistema. No es necesario asignar permisos
                      individuales.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
            <span className="ml-2 text-gray-600">Cargando permisos...</span>
          </div>
        ) : (
          <>
            {/* Acciones rápidas */}
            <div className="flex items-center gap-2 pb-2 border-b">
              <span className="text-sm text-gray-600">Acciones rápidas:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="text-xs"
              >
                <Check className="w-3 h-3 mr-1" />
                Seleccionar todos
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeselectAll}
                className="text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Quitar todos
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={loadPermisos}
                className="text-xs ml-auto"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Recargar
              </Button>
            </div>

            {/* Permisos por módulo */}
            <div className="space-y-4 py-4">
              {MODULES.map((module) => {
                const moduleState = getModuleCheckState(module);
                const modulePermisos = PERMISSIONS_BY_MODULE[module];

                return (
                  <Card key={module} className="overflow-hidden">
                    <CardHeader className="py-3 px-4 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={`module-${module}`}
                          checked={moduleState === 'checked'}
                          ref={(el) => {
                            if (el) {
                              (el as HTMLButtonElement).dataset.state =
                                moduleState;
                            }
                          }}
                          onCheckedChange={() => handleToggleModulo(module)}
                          className={
                            moduleState === 'indeterminate'
                              ? 'data-[state=checked]:bg-slate-400'
                              : ''
                          }
                        />
                        <Label
                          htmlFor={`module-${module}`}
                          className="text-sm font-semibold cursor-pointer flex-1"
                        >
                          {MODULE_LABELS[module]}
                        </Label>
                        <Badge variant="secondary" className="text-xs">
                          {
                            modulePermisos.filter((p) =>
                              selectedPermisos.has(p.permission)
                            ).length
                          }
                          /{modulePermisos.length}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {modulePermisos.map(({ permission, label }) => (
                          <div
                            key={permission}
                            className="flex items-center gap-2"
                          >
                            <Checkbox
                              id={permission}
                              checked={selectedPermisos.has(permission)}
                              onCheckedChange={() =>
                                handleTogglePermiso(permission)
                              }
                            />
                            <Label
                              htmlFor={permission}
                              className="text-sm cursor-pointer text-gray-700"
                            >
                              {label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Resumen */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span>
                  Total de permisos seleccionados:{' '}
                  <strong>{selectedPermisos.size}</strong> de{' '}
                  {ALL_PERMISSIONS.length}
                </span>
                {hasChanges && (
                  <Badge
                    variant="outline"
                    className="bg-yellow-50 text-yellow-700 border-yellow-200"
                  >
                    Cambios sin guardar
                  </Badge>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSaving}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !hasChanges}
                  className="flex-1 bg-slate-600 hover:bg-slate-700"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Permisos
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
