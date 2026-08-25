'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Skeleton } from '@/shared/ui/skeleton';
import { BarChart3, CalendarRange } from 'lucide-react';
import {
  computeServicioAverages,
  filterRecordsByDateRange,
  type HistorialRecordRaw,
} from '@/shared/lib/historial-stats';
import { servicios } from '@/features/asistencia/constants';

/**
 * Single source of truth for the plot area's box. The `next/dynamic` skeleton
 * and the real chart both fill this frame, so nothing shifts when recharts
 * finishes loading. The height grows with the viewport on purpose: a fixed
 * 300px plot inside a full-width desktop card reads as a letterbox.
 */
const CHART_FRAME_CLASS = 'h-[260px] w-full sm:h-[300px] lg:h-[360px]';

const ServicioAveragesChart = dynamic(
  () =>
    import('./ServicioAveragesChart').then((mod) => mod.ServicioAveragesChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full" />,
  }
);

/**
 * Historial records store the servicio **label**, not the enum `value`:
 * `buildConteoData` (src/features/asistencia/lib/calculations.ts) resolves
 * `servicios.find(s => s.value === tipoServicio)?.label || tipoServicio` before
 * writing, so a manually-typed servicio is stored verbatim too. Feeding the
 * enum `value`s here produced a phantom zero-record entry per canonical
 * servicio alongside the real label entry — duplicated bars, one of them always
 * averaging 0.
 */
const servicioLabels = servicios.map((servicio) => servicio.label);

interface ServicioAveragesCardProps {
  records: readonly Pick<HistorialRecordRaw, 'fecha' | 'servicio' | 'total'>[];
  desde: string;
  hasta: string;
  onDesdeChange: (value: string) => void;
  onHastaChange: (value: string) => void;
}

/**
 * Per-servicio averages chart, scoped by an optional `[desde, hasta]` date
 * range. `desde`/`hasta` live at the page level and are applied live (every
 * change re-filters immediately), so the "Limpiar" button below is a reset
 * affordance rather than a required "apply" step. This view is intentionally
 * the only one affected by the date range: `TopFaltantesCard` and the amigos
 * follow-up table use their own, separately-memoized data. The range controls
 * therefore stay inside this card — never in a page-level toolbar, which would
 * imply they filter the whole view.
 */
export function ServicioAveragesCard({
  records,
  desde,
  hasta,
  onDesdeChange,
  onHastaChange,
}: ServicioAveragesCardProps) {
  // Only servicios with at least one record in range reach the chart. A
  // zero-record entry would render a zero-height bar that still owns its slot
  // on the x-axis, so hovering near a real bar could surface that phantom's
  // tooltip instead -- showing an average of 0 and the wrong swatch colour.
  // Spec requirement 4's "empty state, never NaN" is served by omitting the
  // entry and, when nothing is left, by the empty message below.
  const averages = useMemo(
    () =>
      computeServicioAverages(
        filterRecordsByDateRange(records, desde, hasta),
        servicioLabels
      ).filter((row) => row.recordCount > 0),
    [records, desde, hasta]
  );

  const hasActiveFilter = desde !== '' || hasta !== '';

  const recordsInRange = averages.reduce(
    (sum, row) => sum + row.recordCount,
    0
  );

  const clearRange = () => {
    onDesdeChange('');
    onHastaChange('');
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
      <CardHeader className="px-3 sm:px-6">
        {/* On desktop the range controls move up beside the title so the whole
            card body belongs to the plot; below `lg` they wrap underneath. */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1.5">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Promedio por Tipo de Culto
            </CardTitle>
            <CardDescription className="flex items-center gap-1.5 text-xs">
              <CalendarRange className="w-3.5 h-3.5 shrink-0" />
              El rango de fechas afecta solo este gráfico.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="estadisticas-desde" className="text-xs">
                Desde
              </Label>
              <Input
                id="estadisticas-desde"
                type="date"
                value={desde}
                onChange={(event) => onDesdeChange(event.target.value)}
                className="h-9 w-36 sm:w-40"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="estadisticas-hasta" className="text-xs">
                Hasta
              </Label>
              <Input
                id="estadisticas-hasta"
                type="date"
                value={hasta}
                onChange={(event) => onHastaChange(event.target.value)}
                className="h-9 w-36 sm:w-40"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!hasActiveFilter}
              onClick={clearRange}
              className="h-9"
            >
              Limpiar
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-3 sm:px-6">
        {averages.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-200 bg-gray-50/60 px-4 py-12 text-center">
            <BarChart3 className="w-10 h-10 text-gray-300" />
            <p className="text-sm text-gray-500">
              {hasActiveFilter
                ? 'No hay servicios registrados en el rango seleccionado'
                : 'No hay servicios registrados'}
            </p>
            {hasActiveFilter ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearRange}
              >
                Ver todo el historial
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="bg-slate-50 text-slate-700 border-slate-200 text-xs tabular-nums"
              >
                {averages.length}{' '}
                {averages.length === 1 ? 'tipo de culto' : 'tipos de culto'}
              </Badge>
              <Badge
                variant="outline"
                className="bg-slate-50 text-slate-700 border-slate-200 text-xs tabular-nums"
              >
                {recordsInRange}{' '}
                {recordsInRange === 1 ? 'registro' : 'registros'}
              </Badge>
              {hasActiveFilter ? (
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                >
                  Rango activo
                </Badge>
              ) : null}
            </div>

            <div className={CHART_FRAME_CLASS}>
              <ServicioAveragesChart data={averages} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
