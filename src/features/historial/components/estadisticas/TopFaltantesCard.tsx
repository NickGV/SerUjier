import type { FaltantesResult } from '@/shared/lib/historial-stats';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { AlertTriangle, CalendarCheck } from 'lucide-react';

interface TopFaltantesCardProps {
  result: FaltantesResult;
}

const CATEGORIA_LABEL_BY_VALUE: Record<string, string> = {
  hermano: 'Hermanos',
  hermana: 'Hermanas',
  nino: 'Niños',
  adolescente: 'Adolescentes',
};

/**
 * Ranks `esMiembro: true` miembros by services missed in the fixed 90-day
 * window (never scoped by the averages date-range filter above). Two
 * distinct empty states: no services recorded in the window at all, vs.
 * services recorded but every miembro attended (no faltantes to show).
 */
export function TopFaltantesCard({ result }: TopFaltantesCardProps) {
  const { rows, servicesInWindow } = result;

  // The `servicesInWindow === 0` branch below returns before any row renders,
  // so the denominator is always >= 1 by the time it is used. Clamping anyway
  // keeps that guarantee structural rather than positional.
  const denominator = Math.max(servicesInWindow, 1);

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
      <CardHeader className="px-3 sm:px-6">
        <div className="flex flex-col gap-2">
          <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Top Faltantes (últimos 90 días)
          </CardTitle>
          <CardDescription className="text-xs">
            Miembros ordenados por servicios no asistidos.
          </CardDescription>
          {servicesInWindow === 0 ? null : (
            // The denominator every row is measured against, stated once
            // instead of being inferred from the ratios.
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Badge
                variant="outline"
                className="text-xs tabular-nums bg-slate-50 text-slate-600 border-slate-200"
              >
                <CalendarCheck className="mr-1 w-3 h-3" />
                {servicesInWindow}{' '}
                {servicesInWindow === 1
                  ? 'servicio en la ventana'
                  : 'servicios en la ventana'}
              </Badge>
              {rows.length === 0 ? null : (
                <Badge
                  variant="outline"
                  className="text-xs tabular-nums bg-red-50 text-red-700 border-red-200"
                >
                  {rows.length}{' '}
                  {rows.length === 1
                    ? 'miembro con faltas'
                    : 'miembros con faltas'}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        {servicesInWindow === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-200 bg-gray-50/60 px-4 py-12 text-center">
            <CalendarCheck className="w-10 h-10 text-gray-300" />
            <p className="text-sm text-gray-500">
              No hay servicios registrados en los últimos 90 días
            </p>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-emerald-200 bg-emerald-50/50 px-4 py-12 text-center">
            <CalendarCheck className="w-10 h-10 text-emerald-400" />
            <p className="text-sm text-emerald-700">
              Todos los miembros asistieron en los últimos 90 días
            </p>
          </div>
        ) : (
          // Horizontal scroll survives for narrow screens; the capped height
          // from `xl` up keeps this card aligned with the amigos card beside
          // it instead of running far past it.
          <div className="overflow-x-auto xl:max-h-[30rem] xl:overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                {/* Sticky lives on the cells, not on `<thead>`: Tailwind's
                    preflight sets `border-collapse: collapse`, where a sticky
                    `<thead>` is unreliable across browsers. */}
                <tr className="border-b text-left text-xs text-gray-500">
                  <th
                    scope="col"
                    className="sticky top-0 z-10 bg-white/95 py-2 pr-4 font-medium backdrop-blur-sm"
                  >
                    Nombre
                  </th>
                  <th
                    scope="col"
                    className="sticky top-0 z-10 bg-white/95 py-2 pr-4 font-medium backdrop-blur-sm"
                  >
                    Categoría
                  </th>
                  <th
                    scope="col"
                    className="sticky top-0 z-10 bg-white/95 py-2 text-right font-medium backdrop-blur-sm"
                  >
                    Faltas
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const missedPercent = Math.round(
                    (row.missedCount / denominator) * 100
                  );
                  return (
                    <tr
                      key={row.miembroId}
                      className="border-b last:border-0 transition-colors motion-reduce:transition-none hover:bg-slate-50"
                    >
                      <td className="py-2.5 pr-4 font-medium text-gray-800">
                        {row.nombre}
                      </td>
                      <td className="py-2.5 pr-4 text-gray-600">
                        <Badge
                          variant="outline"
                          className="text-xs bg-slate-50 text-slate-600 border-slate-200"
                        >
                          {CATEGORIA_LABEL_BY_VALUE[row.categoria] ??
                            row.categoria}
                        </Badge>
                      </td>
                      <td className="py-2.5">
                        {/* The ratio reads three ways: the bar for the shape of
                            it, the fraction for the exact counts, and the
                            percentage as the plain-text equivalent of the bar
                            (so the meaning never rests on the graphic). */}
                        <div className="flex items-center justify-end gap-2">
                          <div
                            aria-hidden="true"
                            className="hidden h-1.5 w-14 shrink-0 overflow-hidden rounded-full bg-gray-100 sm:block"
                          >
                            <div
                              className="h-full rounded-full bg-red-400"
                              style={{ width: `${missedPercent}%` }}
                            />
                          </div>
                          <span className="tabular-nums whitespace-nowrap">
                            <span className="font-semibold text-red-600">
                              {row.missedCount}
                            </span>
                            <span className="text-gray-400">
                              {' '}
                              / {servicesInWindow}
                            </span>
                          </span>
                          <span className="w-9 text-right text-xs tabular-nums text-gray-400">
                            {missedPercent}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
