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
import { Search, X, Users, User, Trash2 } from 'lucide-react';
import { type AsistentesDialogProps } from './types';
import { getCategoriaLabel, getCategoriaColor } from './utils';

export function AsistentesDialog({
  isOpen,
  onClose,
  asistentes,
  onRemoveAsistente,
}: AsistentesDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset states when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  const filteredAsistentes = asistentes.filter((asistente) =>
    asistente.nombre.toLowerCase().includes(searchDebounce.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl lg:max-w-5xl max-h-[95vh] overflow-hidden flex flex-col mx-2 sm:mx-0">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="text-base sm:text-lg flex items-center justify-between">
            <span>Lista de Asistentes</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {filteredAsistentes.length} encontrados
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Búsqueda de asistentes */}
          <div className="flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar asistentes por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 text-sm"
              />
            </div>
            {searchTerm && (
              <div className="mt-2 text-xs text-gray-500">
                Buscando: &ldquo;{searchTerm}&rdquo;
              </div>
            )}
          </div>

          {/* Lista de asistentes */}
          <div className="flex-1 overflow-hidden">
            <div className="h-[500px] sm:h-[600px] overflow-y-auto space-y-2 pr-1 border rounded-lg p-3 bg-gray-50/50">
              {filteredAsistentes.length > 0 ? (
                filteredAsistentes.map((asistente) => (
                  <Card
                    key={asistente.id}
                    className={`bg-white border-gray-200 hover:shadow-md transition-all duration-200 ${
                      asistente.esBase ? 'border-dashed' : 'border-solid'
                    }`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div
                            className={`w-10 h-10 ${getCategoriaColor(asistente.categoria)} rounded-full flex items-center justify-center flex-shrink-0`}
                          >
                            <User className="w-5 h-5" />
                          </div>

                          {/* Información */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 text-sm truncate">
                                {asistente.nombre}
                              </h3>
                              {asistente.esBase && (
                                <Badge
                                  variant="outline"
                                  className="bg-blue-50 text-blue-700 text-xs"
                                >
                                  Base
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge
                                variant="outline"
                                className={`text-xs ${getCategoriaColor(
                                  asistente.categoria
                                )}`}
                              >
                                {getCategoriaLabel(asistente.categoria)}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  asistente.tipo === 'miembro'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-green-50 text-green-700 border-green-200'
                                }`}
                              >
                                {asistente.tipo === 'miembro'
                                  ? 'Miembro'
                                  : 'Simpatizante'}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Botón de eliminar */}
                        {!asistente.esBase && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                            onClick={() => {
                              onRemoveAsistente(
                                asistente.id,
                                asistente.categoria,
                                asistente.tipo
                              );
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">
                    {searchDebounce
                      ? `No se encontraron asistentes que coincidan con "${searchDebounce}"`
                      : 'No hay asistentes registrados'}
                  </p>
                  {searchDebounce && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 text-xs"
                      onClick={() => setSearchTerm('')}
                    >
                      <X className="w-3 h-3 mr-1" />
                      Limpiar búsqueda
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex-shrink-0 pt-3 border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 bg-transparent text-sm"
                onClick={() => {
                  onClose();
                  setSearchTerm('');
                }}
              >
                <X className="w-4 h-4 mr-1" />
                Cerrar
              </Button>
              {searchTerm && (
                <Button
                  variant="outline"
                  className="flex-1 bg-blue-50 text-blue-700 border-blue-200 text-sm"
                  onClick={() => setSearchTerm('')}
                >
                  <Search className="w-4 h-4 mr-1" />
                  Limpiar Búsqueda
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
