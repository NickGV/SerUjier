'use client';

import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { User, Users, Trash2 } from 'lucide-react';
import { type SimpatizanteLite } from '../types';
import { getCategoriaColor } from '../utils/helpers';

interface SimpatizantesListProps {
  simpatizantesDelDia: SimpatizanteLite[];
  onRemoveSimpatizante: (id: string) => void;
}

export function SimpatizantesList({
  simpatizantesDelDia,
  onRemoveSimpatizante,
}: SimpatizantesListProps) {
  if (simpatizantesDelDia.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Simpatizantes con Nombre (Añadidos hoy: {simpatizantesDelDia.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {simpatizantesDelDia.map((simpatizante) => (
          <Card
            key={simpatizante.id}
            className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar con ícono de persona */}
                  <div
                    className={`w-12 h-12 ${getCategoriaColor('simpatizantes')} rounded-full flex items-center justify-center flex-shrink-0`}
                  >
                    <User className="w-6 h-6" />
                  </div>

                  {/* Información del simpatizante */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-base mb-1">
                      {simpatizante.nombre}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {simpatizante.telefono || 'Sin teléfono'}
                    </p>

                    {/* Badge y fecha */}
                    <div className="flex items-center gap-3 mt-2">
                      <Badge
                        variant="secondary"
                        className="bg-pink-50 text-pink-700 border-pink-200 text-xs px-2 py-1"
                      >
                        Simpatizante
                      </Badge>
                      <span className="text-xs text-gray-500">Añadido hoy</span>
                    </div>
                  </div>
                </div>

                {/* Botón de eliminar */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => onRemoveSimpatizante(simpatizante.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
