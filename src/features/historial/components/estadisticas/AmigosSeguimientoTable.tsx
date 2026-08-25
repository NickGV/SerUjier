import type { AmigoSeguimientoRow } from '@/shared/lib/historial-stats';
import { cn } from '@/shared/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { AlertCircle, Users } from 'lucide-react';

interface AmigosSeguimientoTableProps {
  rows: AmigoSeguimientoRow[];
}

/** Days without a visit at which a row starts reading as urgent. */
const STALE_AFTER_DAYS = 30;
/** Days without a visit at which a row reads as critical. */
const CRITICAL_AFTER_DAYS = 60;

type Urgency = 'never' | 'critical' | 'stale' | 'recent';

function resolveUrgency(diasSinVisitar: number | null): Urgency {
  if (diasSinVisitar === null) return 'never';
  if (diasSinVisitar >= CRITICAL_AFTER_DAYS) return 'critical';
  if (diasSinVisitar >= STALE_AFTER_DAYS) return 'stale';
  return 'recent';
}

/**
 * Tone per urgency tier. Every tier that matters also carries an icon or the
 * literal word "nunca", so the signal never rests on colour alone.
 */
const URGENCY_TONE: Record<Urgency, string> = {
  never: 'bg-red-50 text-red-700 border-red-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
  stale: 'bg-amber-50 text-amber-700 border-amber-200',
  recent: 'bg-slate-50 text-slate-600 border-slate-200',
};

/**
 * All-time follow-up table: one row per amigo, sorted stalest-first. Amigos
 * with no recorded visit sort last and render "nunca" — never a separate
 * group. This view is not scoped by the date-range filter.
 */
export function AmigosSeguimientoTable({ rows }: AmigosSeguimientoTableProps) {
  // Single pass: this component takes no hooks on purpose (it is a plain
  // presentational function) and the amigos list is small.
  let neverCount = 0;
  let staleCount = 0;
  for (const row of rows) {
    if (row.diasSinVisitar === null) {
      neverCount += 1;
    } else if (row.diasSinVisitar >= STALE_AFTER_DAYS) {
      staleCount += 1;
    }
  }

  return (
    // Slightly heavier elevation than its neighbour, plus the accent strip
    // below: this is the block the owner acts on.
    <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <div
        aria-hidden="true"
        className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-red-400"
      />
      <CardHeader className="px-3 sm:px-6">
        <div className="flex flex-col gap-2">
          <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Seguimiento de Amigos
          </CardTitle>
          <CardDescription className="text-xs">
            Historial completo, del más frío al más reciente.
          </CardDescription>
          {rows.length === 0 ? null : (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {neverCount > 0 ? (
                <Badge
                  variant="outline"
                  className="text-xs tabular-nums bg-red-50 text-red-700 border-red-200"
                >
                  <AlertCircle className="mr-1 w-3 h-3" />
                  {neverCount} sin visitar nunca
                </Badge>
              ) : null}
              {staleCount > 0 ? (
                <Badge
                  variant="outline"
                  className="text-xs tabular-nums bg-amber-50 text-amber-700 border-amber-200"
                >
                  {staleCount} con más de {STALE_AFTER_DAYS} días
                </Badge>
              ) : null}
              <Badge
                variant="outline"
                className="text-xs tabular-nums bg-slate-50 text-slate-600 border-slate-200"
              >
                {rows.length} {rows.length === 1 ? 'amigo' : 'amigos'}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-200 bg-gray-50/60 px-4 py-12 text-center">
            <Users className="w-10 h-10 text-gray-300" />
            <p className="text-sm text-gray-500">No hay amigos registrados</p>
          </div>
        ) : (
          // Horizontal scroll survives for narrow screens. From `xl` up the
          // list also gets a capped height with its own vertical scroll, so a
          // long amigos list cannot push the side-by-side faltantes card far
          // down the page.
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
                    Última visita
                  </th>
                  <th
                    scope="col"
                    className="sticky top-0 z-10 bg-white/95 py-2 text-right font-medium backdrop-blur-sm"
                  >
                    Días sin visitar
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const urgency = resolveUrgency(row.diasSinVisitar);
                  return (
                    <tr
                      key={row.amigoId}
                      className={cn(
                        'border-b last:border-0 transition-colors motion-reduce:transition-none hover:bg-slate-50',
                        urgency === 'never' && 'bg-red-50/40'
                      )}
                    >
                      <td className="py-2.5 pr-4 font-medium text-gray-800">
                        {row.nombre}
                      </td>
                      <td className="py-2.5 pr-4 text-gray-600">
                        {row.ultimaVisita ? (
                          <span className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                            <span className="tabular-nums whitespace-nowrap">
                              {row.ultimaVisita.fecha}
                            </span>
                            <Badge
                              variant="outline"
                              className="w-fit text-xs bg-slate-50 text-slate-600 border-slate-200"
                            >
                              {row.ultimaVisita.servicio}
                            </Badge>
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-2.5 text-right">
                        {row.diasSinVisitar === null ? (
                          <Badge
                            variant="outline"
                            className={cn('text-xs', URGENCY_TONE.never)}
                          >
                            <AlertCircle className="mr-1 w-3 h-3" />
                            nunca
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-xs tabular-nums',
                              URGENCY_TONE[urgency]
                            )}
                          >
                            {urgency === 'critical' ? (
                              <AlertCircle className="mr-1 w-3 h-3" />
                            ) : null}
                            {row.diasSinVisitar}
                          </Badge>
                        )}
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
