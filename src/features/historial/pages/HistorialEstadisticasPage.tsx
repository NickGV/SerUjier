'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RoleGuard } from '@/shared/components/role-guard';
import { fetchAmigos, fetchHistorial } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { ArrowLeft, BarChart3, FileText } from 'lucide-react';
import {
  buildAmigosSeguimiento,
  normalizeHistorialRecord,
  todayISODate,
  type HistorialRecordRaw,
  type NormalizedHistorialFields,
} from '@/shared/lib/historial-stats';
import { AmigosSeguimientoTable } from '@/features/historial/components/estadisticas/AmigosSeguimientoTable';

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

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // `fetchMiembros()` is deliberately absent here: slice A renders only
        // the all-time amigos follow-up table. The miembros read arrives with
        // the top-faltantes card (slice B), so this view issues no query it
        // does not consume.
        const [historialData, amigosData] = await Promise.all([
          fetchHistorial(),
          fetchAmigos(),
        ]);

        const records = (historialData as HistorialRecordAPI[]).map(
          normalizeHistorialRecord
        );

        setData({
          records,
          amigos: amigosData,
          today: todayISODate(),
        });
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Error cargando estadísticas';
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
    <div className="p-2 sm:p-4 space-y-4 sm:space-y-6 min-h-screen max-w-full overflow-x-hidden">
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="px-3 sm:px-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/historial')}
            className="mb-4 w-fit"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Historial
          </Button>
          <CardTitle className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
            Estadísticas de Historial
          </CardTitle>
        </CardHeader>
      </Card>

      <AmigosSeguimientoTable rows={amigosSeguimiento} />
    </div>
  );
}
