'use client';

import { sortByNombre } from '@/shared/lib/sort-utils';
import { type Simpatizante } from '@/shared/types';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Edit3, Trash2, User, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SimpatizantesListProps {
  simpatizantes: Simpatizante[];
  onEdit?: (simpatizante: Simpatizante) => void;
  onDelete?: (simpatizante: Simpatizante) => void;
  searchTerm: string;
}

export function SimpatizantesList({
  simpatizantes,
  onEdit,
  onDelete,
  searchTerm,
}: SimpatizantesListProps) {
  const router = useRouter();

  if (simpatizantes.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
        <CardContent className="p-8 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No se encontraron simpatizantes
          </h3>
          <p className="text-gray-500">
            {searchTerm
              ? 'Intenta con un término de búsqueda diferente o más específico'
              : 'Comienza agregando el primer simpatizante usando el botón de arriba'}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Ordenar simpatizantes alfabéticamente
  const sortedSimpatizantes = sortByNombre(simpatizantes);

  return (
    <div className="space-y-3">
      {sortedSimpatizantes.map((simpatizante) => (
        <Card
          key={simpatizante.id}
          className="bg-white/80 backdrop-blur-sm border-0 shadow-md cursor-pointer"
          onClick={() => router.push(`/simpatizantes/${simpatizante.id}`)}
        >
          <CardContent className="p-4">
            <div className="flex justify-between">
              <div className="flex flex-col gap-4">
                {/* Avatar con ícono de persona */}
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-black" />
                  <h3 className="font-semibold text-gray-900 text-base mb-1">
                    {simpatizante.nombre}
                  </h3>
                </div>

                {/* Información del simpatizante */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600">
                    {simpatizante.notas || 'Sin notas'}
                  </p>

                  {/* Badge y fecha en la misma línea */}
                  <div className="flex items-center gap-3 mt-2">
                    <Badge
                      variant="secondary"
                      className="bg-pink-50 text-pink-700 border-pink-200 text-xs px-2 py-1"
                    >
                      Simpatizante
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Desde:{' '}
                      {simpatizante.fechaRegistro
                        ? new Date(
                            simpatizante.fechaRegistro
                          ).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 px-4 hover:bg-blue-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/simpatizantes/${simpatizante.id}`);
                  }}
                >
                  Ver Perfil
                </Button>

                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label="Editar simpatizante"
                    className="h-10 w-10 p-0 text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(simpatizante);
                    }}
                  >
                    <Edit3 className="w-5 h-5" />
                  </Button>
                )}

                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label="Eliminar simpatizante"
                    className="h-10 w-10 p-0 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(simpatizante);
                    }}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
