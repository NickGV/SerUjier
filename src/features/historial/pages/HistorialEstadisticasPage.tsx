'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RoleGuard } from '@/shared/components/role-guard';
import { fetchAmigos, fetchHistorial } from '@/shared/lib/utils';
import { fetchMiembros } from '@/shared/firebase/miembros';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { ArrowLeft, BarChart3, FileText } from 'lucide-react';
import {
  buildAmigosSeguimiento,
  computeTopFaltantes,
  normalizeHistorialRecord,
  todayISODate,
  type HistorialRecordRaw,
  type MiembroLike,
  type NormalizedHistorialFields,
} from '@/shared/lib/historial-stats';
import { AmigosSeguimientoTable } from '@/features/historial/components/estadisticas/AmigosSeguimientoTable';
import { ServicioAveragesCard } from '@/features/historial/components/estadisticas/ServicioAveragesCard';
import { TopFaltantesCard } from '@/features/historial/components/estadisticas/TopFaltantesCard';

interface HistorialRecordAPI extends HistorialRecordRaw {
  id: string;
}

type HistorialRecord = HistorialRecordAPI & NormalizedHistorialFields;

interface Amigo {
  id: string;
  nombre: string;
}

interface EstadisticasState {
  records: HistorialRecord[];
  amigos: Amigo[];
  miembros: MiembroLike[];
  today: string;
}

export default function HistorialEstadisticasPage() {
  return (
    <RoleGuard requiredPermission="historial.view">
      <HistorialEstadisticasContent />
    </RoleGuard>
  );
}

function HistorialEstadisticasContent() {
  const router = useRouter();
  const [data, setData] = useState<EstadisticasState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Every read below is scoped to this view: `fetchMiembros()` feeds
        // only the top-faltantes card (esMiembro:true ranking), it never
        // triggers a write and never touches the amigos/historial reads
        // used elsewhere on the page.
        const [historialData, amigosData, miembrosData] = await Promise.all([
          fetchHistorial(),
          fetchAmigos(),
          fetchMiembros(),
        ]);

        const records = (historialData as HistorialRecordAPI[]).map(
          normalizeHistorialRecord
        );

        setData({
          records,
          amigos: amigosData,
          miembros: miembrosData,
          today: todayISODate(),
        });
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Error cargando estadísticas';
        console.error('Error cargando estadísticas de historial:', err);
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const amigosSeguimiento = useMemo(() => {
    if (!data) return [];
    return buildAmigosSeguimiento(data.amigos, data.records, data.today);
  }, [data]);

  const topFaltantes = useMemo(() => {
    if (!data) {
      return { windowStart: 0, windowEnd: 0, servicesInWindow: 0, rows: [] };
    }
    return computeTopFaltantes(data.miembros, data.records, data.today);
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <FileText className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Intentar de nuevo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    // Desktop-first shell: the content column is capped at `max-w-7xl` and
    // centred, so on a 1920px monitor the tables stop stretching edge to edge
    // and keep a readable measure. Gutters grow with the viewport instead of
    // the columns.
    <div className="min-h-screen w-full overflow-x-hidden px-2 py-3 sm:px-4 sm:py-4 lg:px-8 lg:py-6">
      <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-6">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="px-3 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1.5">
                <CardTitle className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                  Estadísticas de Historial
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Promedios por tipo de culto, seguimiento de amigos y faltantes
                  recientes.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/historial')}
                className="w-fit shrink-0"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Historial
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Reading order is fixed at 1) promedios, 2) amigos, 3) faltantes.
            The chart spans the full column because it is the one block that
            actually benefits from horizontal room. */}
        <ServicioAveragesCard
          records={data?.records ?? []}
          desde={desde}
          hasta={hasta}
          onDesdeChange={setDesde}
          onHastaChange={setHasta}
        />

        {/* From `xl` up the two follow-up tables sit side by side, amigos on
            the left, so left-to-right reading still yields amigos (2) before
            faltantes (3). Below `xl` — every tablet, portrait or landscape —
            they stack in that same order at full width, where a 3-column
            table with a servicio badge is comfortable. `items-start` stops the
            shorter card from being stretched to match the taller one. */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2 xl:items-start">
          {/* Amigos follow-up leads the pair: chasing visitors who stopped
              coming is the reason this view exists. */}
          <AmigosSeguimientoTable rows={amigosSeguimiento} />

          <TopFaltantesCard result={topFaltantes} />
        </div>
      </div>
    </div>
  );
}
