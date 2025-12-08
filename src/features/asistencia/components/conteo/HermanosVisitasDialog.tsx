'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { X, Plus, CheckCircle, Trash2, Users, User } from 'lucide-react';
import { toast } from 'sonner';
import { type HermanosVisitasDialogProps } from './types';

export function HermanosVisitasDialog({
  isOpen,
  onClose,
  hermanosVisitasDelDia,
  onAddHermanoVisita,
  onRemoveHermanoVisita,
}: HermanosVisitasDialogProps) {
  const [showNewForm, setShowNewForm] = useState(false);
  const [newHermanoVisita, setNewHermanoVisita] = useState({
    nombre: '',
    iglesia: '',
  });

  // Reset states when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setShowNewForm(false);
      setNewHermanoVisita({ nombre: '', iglesia: '' });
    }
  }, [isOpen]);

  const handleAddNewHermanoVisita = async () => {
    if (!newHermanoVisita.nombre.trim()) return;

    try {
      await onAddHermanoVisita({
        nombre: newHermanoVisita.nombre.trim(),
        iglesia: newHermanoVisita.iglesia.trim() || undefined,
      });
      setNewHermanoVisita({ nombre: '', iglesia: '' });
      setShowNewForm(false);
      toast.success('Hermano visita agregado exitosamente');
    } catch (error) {
      console.error('Error agregando hermano visita:', error);
      toast.error('Error al agregar hermano visita. Intente nuevamente.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col mx-2 sm:mx-0">
        <DialogHeader className="flex-shrink-0 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base sm:text-lg">
              Hermanos Visitas
            </DialogTitle>
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700">
              {hermanosVisitasDelDia.length} agregados
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {!showNewForm ? (
            <>
              {/* Hermanos visitas ya agregados */}
              {hermanosVisitasDelDia.length > 0 && (
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-indigo-700 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Hermanos Visitas Agregados ({hermanosVisitasDelDia.length}
                      )
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 text-xs h-6 px-2"
                      onClick={() => {
                        hermanosVisitasDelDia.forEach((h) =>
                          onRemoveHermanoVisita(h.id)
                        );
                        toast.info('Hermanos visitas eliminados');
                      }}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Limpiar Todo
                    </Button>
                  </div>
                  <div className="max-h-96 overflow-y-auto space-y-2 pr-1 border rounded-lg p-2 bg-indigo-50/50">
                    {hermanosVisitasDelDia.map((hermanoVisita) => (
                      <Card
                        key={hermanoVisita.id}
                        className="bg-white border-indigo-200 hover:shadow-md transition-all duration-200"
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {/* Avatar */}
                              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-indigo-600" />
                              </div>

                              {/* Información */}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 text-sm truncate">
                                  {hermanoVisita.nombre}
                                </h3>
                                {hermanoVisita.iglesia && (
                                  <p className="text-xs text-gray-600 mt-0.5 truncate">
                                    Iglesia: {hermanoVisita.iglesia}
                                  </p>
                                )}
                                <Badge
                                  variant="outline"
                                  className="bg-indigo-50 text-indigo-700 text-xs mt-1"
                                >
                                  Hermano Visita
                                </Badge>
                              </div>
                            </div>

                            {/* Botón de eliminar */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                              onClick={() =>
                                onRemoveHermanoVisita(hermanoVisita.id)
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Vista vacía o información */}
              {hermanosVisitasDelDia.length === 0 && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500 py-8">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm mb-2">
                      No hay hermanos visitas agregados
                    </p>
                    <p className="text-xs text-gray-400">
                      Los hermanos visitas son hermanos de otras iglesias
                    </p>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex-shrink-0 pt-3 border-t space-y-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent text-sm"
                    onClick={onClose}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cerrar
                  </Button>
                  <Button
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-sm"
                    onClick={() => setShowNewForm(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Hermano Visita
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Formulario para nuevo hermano visita */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                  <div className="flex items-center gap-2 text-indigo-800 text-sm font-medium">
                    <Plus className="w-4 h-4" />
                    Nuevo Hermano Visita
                  </div>
                  <p className="text-indigo-600 text-xs mt-1">
                    Ingrese el nombre del hermano visitante de otra iglesia
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Nombre Completo *
                  </label>
                  <Input
                    placeholder="Nombre del hermano visitante"
                    value={newHermanoVisita.nombre}
                    onChange={(e) =>
                      setNewHermanoVisita({
                        ...newHermanoVisita,
                        nombre: e.target.value,
                      })
                    }
                    className="h-10 text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newHermanoVisita.nombre.trim()) {
                        handleAddNewHermanoVisita();
                      }
                    }}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Iglesia
                  </label>
                  <Input
                    placeholder="Nombre de la iglesia visitante"
                    value={newHermanoVisita.iglesia}
                    onChange={(e) =>
                      setNewHermanoVisita({
                        ...newHermanoVisita,
                        iglesia: e.target.value,
                      })
                    }
                    className="h-10 text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newHermanoVisita.nombre.trim()) {
                        handleAddNewHermanoVisita();
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Opcional: De qué iglesia nos visita
                  </p>
                </div>
              </div>

              <div className="flex-shrink-0 pt-3 border-t">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent h-10 text-sm"
                    onClick={() => setShowNewForm(false)}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Volver
                  </Button>
                  <Button
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 h-10 text-sm"
                    onClick={handleAddNewHermanoVisita}
                    disabled={!newHermanoVisita.nombre.trim()}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
