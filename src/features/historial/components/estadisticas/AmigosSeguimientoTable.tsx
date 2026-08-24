import type { AmigoSeguimientoRow } from '@/shared/lib/historial-stats';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Users } from 'lucide-react';

interface AmigosSeguimientoTableProps {
  rows: AmigoSeguimientoRow[];
}

/**
 * All-time follow-up table: one row per amigo, sorted stalest-first. Amigos
 * with no recorded visit sort last and render "nunca" — never a separate
 * group. This view is not scoped by the date-range filter.
 */
export function AmigosSeguimientoTable({ rows }: AmigosSeguimientoTableProps) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Seguimiento de Amigos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No hay amigos registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-gray-500">
                  <th className="py-2 pr-4 font-medium">Nombre</th>
                  <th className="py-2 pr-4 font-medium">Última visita</th>
                  <th className="py-2 font-medium">Días sin visitar</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.amigoId}
                    className="border-b last:border-0 hover:bg-slate-50"
                  >
                    <td className="py-2 pr-4 font-medium text-gray-800">
                      {row.nombre}
                    </td>
                    <td className="py-2 pr-4 text-gray-600">
                      {row.ultimaVisita ? (
                        <span>
                          {row.ultimaVisita.fecha}{' '}
                          <Badge
                            variant="outline"
                            className="ml-1 text-xs bg-slate-50 text-slate-600 border-slate-200"
                          >
                            {row.ultimaVisita.servicio}
                          </Badge>
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-2">
                      {row.diasSinVisitar === null ? (
                        <Badge
                          variant="outline"
                          className="text-xs bg-red-50 text-red-600 border-red-200"
                        >
                          nunca
                        </Badge>
                      ) : (
                        <span className="font-semibold text-slate-700">
                          {row.diasSinVisitar}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
