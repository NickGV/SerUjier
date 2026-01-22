'use client';

import { sortByNombre } from '@/shared/lib/sort-utils';
import { type Visita } from '@/shared/types';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Edit3, Trash2, User, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface VisitasListProps {
  visitas: Visita[];
  onEdit?: (visita: Visita) => void;
  onDelete?: (visita: Visita) => void;
  searchTerm: string;
}

export function VisitasList({
  visitas,
  onEdit,
  onDelete,
  searchTerm,
}: VisitasListProps) {
  const router = useRouter();

  if (visitas.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
        <CardContent className="p-8 text-center">
          <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No se encontraron visitas
          </h3>
          <p className="text-gray-500">
            {searchTerm
              ? 'Intenta con un término de búsqueda diferente o más específico'
              : 'Comienza agregando la primera visita usando el botón de arriba'}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Ordenar visitas alfabéticamente
  const sortedVisitas = sortByNombre(visitas);

  return (
    <div className="space-y-3">
      {sortedVisitas.map((visita) => (
        <Card
          key={visita.id}
          className="bg-white/80 backdrop-blur-sm border-0 shadow-md cursor-pointer"
          onClick={() => router.push(`/visitas/${visita.id}`)}
        >
          <CardContent className="p-4">
            <div className="flex justify-between">
              <div className="flex flex-col gap-4">
                {/* Avatar con ícono de persona */}
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-black" />
                  <h3 className="font-semibold text-gray-900 text-base mb-1">
                    {visita.nombre}
                  </h3>
                </div>

                {/* Información de la visita */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600">
                    {visita.notas || 'Sin notas'}
                  </p>

                  {/* Badge y fecha en la misma línea */}
                  <div className="flex items-center gap-3 mt-2">
                    <Badge
                      variant="secondary"
                      className="bg-green-50 text-green-700 border-green-200 text-xs px-2 py-1"
                    >
                      Visita
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Desde:{' '}
                      {visita.fechaRegistro
                        ? new Date(visita.fechaRegistro).toLocaleDateString(
                            'es-ES',
                            {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            }
                          )
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 px-4 hover:bg-blue-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/visitas/${visita.id}`);
                  }}
                >
                  Ver Perfil
                </Button>

                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label="Editar visita"
                    className="h-10 w-10 p-0 text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(visita);
                    }}
                  >
                    <Edit3 className="w-5 h-5" />
                  </Button>
                )}

                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label="Eliminar visita"
                    className="h-10 w-10 p-0 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(visita);
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
