'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '@/shared/contexts/user-context';
import { getHistorialRecordById, fetchMiembros } from '@/shared/lib/utils';
import { RoleGuard } from '@/shared/components/role-guard';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import {
  Calendar,
  ArrowLeft,
  Download,
  Users,
  User,
  UserCheck,
  UserX,
  Edit3,
  Search,
  Filter,
  AlertCircle,
  Baby,
  Zap,
  Heart,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import {
  buildDetailWorkbook,
  buildConteoWorkbook,
} from '@/shared/lib/export/excel';
import {
  buildDetailPdfDocument,
  buildConteoPdfDocument,
} from '@/shared/lib/export/pdf';
import type {
  DetailAction,
  DetailExportRow,
  CountExportInput,
} from '@/shared/lib/export/types';
import {
  downloadBlob,
  generateDetailFilename,
  generateConteoFilename,
  buildConteoCsv,
  loadLogoBase64,
} from '@/shared/lib/export/utils';
import { toast } from 'sonner';

interface HistorialRecordAPI {
  id: string;
  fecha: string;
  servicio: string;
  ujier: string | string[];
  hermanos: number;
  hermanas: number;
  ninos: number;
  adolescentes: number;
  amigos?: number;
  simpatizantes?: number; // Legacy field
  total: number;
  amigosAsistieron?: Array<{ id: string; nombre: string }>;
  simpatizantesAsistieron?: Array<{ id: string; nombre: string }>; // Legacy field
  visitasAsistieron?: Array<{ id: string; nombre: string }>; // Legacy field
  miembrosAsistieron?: {
    hermanos?: Array<{ id: string; nombre: string }>;
    hermanas?: Array<{ id: string; nombre: string }>;
    ninos?: Array<{ id: string; nombre: string }>;
    adolescentes?: Array<{ id: string; nombre: string }>;
    heRestauracion?: Array<{ id: string; nombre: string }>;
  };
  hermanosVisitasAsistieron?: Array<{ id: string; nombre: string }>;
  heRestauracion?: number;
  hermanosVisitas?: number;
}

interface HistorialRecord extends HistorialRecordAPI {
  amigos: number;
  heRestauracion: number;
  hermanosVisitas: number;
}

interface Miembro {
  id: string;
  nombre: string;
  telefono?: string;
  categoria: 'hermano' | 'hermana' | 'nino' | 'adolescente';
  notas?: string;
  fechaRegistro: string;
}

interface AsistenteInfo {
  id: string;
  nombre: string;
  categoria: string;
  tipo: 'miembro' | 'amigo';
}

interface PersonaFiltrada {
  id: string;
  nombre: string;
  categoria: string;
  tipo: 'miembro' | 'amigo';
  status: 'asistente' | 'faltante';
}

export default function ServicioHistorialPage() {
  return (
    <RoleGuard route="historial" allowedRoles={['admin', 'directiva']}>
      <ServicioHistorialContent />
    </RoleGuard>
  );
}

function ServicioHistorialContent() {
  const router = useRouter();
  const params = useParams();
  const { user } = useUser();
  const [record, setRecord] = useState<HistorialRecord | null>(null);
  const [allMembers, setAllMembers] = useState<Miembro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<
    'all' | 'asistentes' | 'faltantes'
  >('all');
  const [filterCategoria, setFilterCategoria] = useState<string>('all');
  const [isExportingDetail, setIsExportingDetail] = useState(false);

  const recordId = params.id as string;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [recordData, membersData] = await Promise.all([
          getHistorialRecordById(recordId),
          fetchMiembros(),
        ]);
        // Ensure new fields exist with default values
        const recordApi = recordData as HistorialRecordAPI;
        const normalizedRecord: HistorialRecord = {
          ...recordApi,
          amigos: recordApi.amigos ?? recordApi.simpatizantes ?? 0,
          amigosAsistieron:
            recordApi.amigosAsistieron ??
            recordApi.simpatizantesAsistieron ??
            recordApi.visitasAsistieron ??
            [],
          heRestauracion: recordApi.heRestauracion || 0,
          hermanosVisitas: recordApi.hermanosVisitas || 0,
        };
        setRecord(normalizedRecord);
        setAllMembers(membersData);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error cargando datos';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    if (recordId) {
      loadData();
    }
  }, [recordId]);

  // Verificar permisos después de cargar los datos
  if (user && user.rol !== 'directiva' && user.rol !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <Calendar className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Acceso Denegado
            </h2>
            <p className="text-gray-600 mb-4">
              No tienes permisos para ver los detalles del historial.
            </p>
            <Button onClick={() => router.back()} variant="outline">
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Obtener todos los asistentes
  const getAllAsistentes = (): AsistenteInfo[] => {
    if (!record) return [];

    const asistentes: AsistenteInfo[] = [];

    // Agregar amigos
    if (record.amigosAsistieron) {
      record.amigosAsistieron.forEach((amigo) => {
        asistentes.push({
          id: amigo.id,
          nombre: amigo.nombre,
          categoria: 'Amigos',
          tipo: 'amigo',
        });
      });
    }

    // Agregar miembros por categoría
    if (record.miembrosAsistieron) {
      Object.entries(record.miembrosAsistieron).forEach(
        ([categoria, miembros]) => {
          if (miembros) {
            miembros.forEach((miembro) => {
              asistentes.push({
                id: miembro.id,
                nombre: miembro.nombre,
                categoria:
                  categoria.charAt(0).toUpperCase() + categoria.slice(1),
                tipo: 'miembro',
              });
            });
          }
        }
      );
    }

    // Agregar hermanos visitas
    if (record.hermanosVisitasAsistieron) {
      record.hermanosVisitasAsistieron.forEach((hermanoVisita) => {
        asistentes.push({
          id: hermanoVisita.id,
          nombre: hermanoVisita.nombre,
          categoria: 'Hermanos Visitas',
          tipo: 'miembro',
        });
      });
    }

    return asistentes;
  };

  // Obtener miembros faltantes
  const getMiembrosFaltantes = (): (Miembro & {
    categoria_display: string;
  })[] => {
    if (!record) return [];

    const asistentes = getAllAsistentes();
    const asistenteIds = new Set(
      asistentes.filter((a) => a.tipo === 'miembro').map((a) => a.id)
    );

    return allMembers
      .filter((miembro) => !asistenteIds.has(miembro.id))
      .map((miembro) => ({
        ...miembro,
        categoria_display:
          miembro.categoria === 'hermano'
            ? 'Hermanos'
            : miembro.categoria === 'hermana'
              ? 'Hermanas'
              : miembro.categoria === 'nino'
                ? 'Niños'
                : miembro.categoria === 'adolescente'
                  ? 'Adolescentes'
                  : 'HeRestauracion',
      }));
  };

  // Filtrar datos según los filtros activos
  const getFilteredData = (): PersonaFiltrada[] => {
    const asistentes = getAllAsistentes();
    const faltantes = getMiembrosFaltantes();

    let dataToFilter: PersonaFiltrada[] = [];

    if (filterType === 'all') {
      dataToFilter = [
        ...asistentes.map((a) => ({ ...a, status: 'asistente' as const })),
        ...faltantes.map((f) => ({
          id: f.id,
          nombre: f.nombre,
          categoria: f.categoria_display,
          tipo: 'miembro' as const,
          status: 'faltante' as const,
        })),
      ];
    } else if (filterType === 'asistentes') {
      dataToFilter = asistentes.map((a) => ({
        ...a,
        status: 'asistente' as const,
      }));
    } else {
      dataToFilter = faltantes.map((f) => ({
        id: f.id,
        nombre: f.nombre,
        categoria: f.categoria_display,
        tipo: 'miembro' as const,
        status: 'faltante' as const,
      }));
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      dataToFilter = dataToFilter.filter((item) =>
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por categoría
    if (filterCategoria !== 'all') {
      dataToFilter = dataToFilter.filter(
        (item) => item.categoria.toLowerCase() === filterCategoria.toLowerCase()
      );
    }

    return dataToFilter;
  };

  const getCategoriaColor = (
    categoria: string,
    status?: 'asistente' | 'faltante'
  ) => {
    if (status === 'faltante') {
      return `bg-red-50 border-red-200 text-red-700`;
    }

    const baseColor =
      {
        hermanos: 'slate',
        hermanas: 'rose',
        niños: 'amber',
        adolescentes: 'purple',
        amigos: 'emerald',
        herestauracion: 'orange',
        'hermanos visitas': 'indigo',
      }[categoria.toLowerCase()] || 'gray';

    return `bg-${baseColor}-50 border-${baseColor}-200 text-${baseColor}-700`;
  };

  // Función para obtener el icono según la categoría
  const getCategoriaIcon = (
    categoria: string,
    status?: 'asistente' | 'faltante'
  ) => {
    const iconSize = 'w-5 h-5';

    if (status === 'faltante') {
      // Para faltantes, usar iconos en rojo
      switch (categoria.toLowerCase()) {
        case 'hermanos':
          return <User className={`${iconSize} text-red-600`} />;
        case 'hermanas':
          return <Heart className={`${iconSize} text-red-600`} />;
        case 'niños':
          return <Baby className={`${iconSize} text-red-600`} />;
        case 'adolescentes':
          return <Zap className={`${iconSize} text-red-600`} />;
        case 'amigos':
          return <Users className={`${iconSize} text-red-600`} />;
        case 'herestauracion':
          return <User className={`${iconSize} text-red-600`} />;
        case 'hermanos visitas':
          return <Users className={`${iconSize} text-red-600`} />;
        default:
          return <UserX className={`${iconSize} text-red-600`} />;
      }
    }

    // Para asistentes, usar colores distintivos
    switch (categoria.toLowerCase()) {
      case 'hermanos':
        return <User className={`${iconSize} text-slate-600`} />;
      case 'hermanas':
        return <Heart className={`${iconSize} text-rose-600`} />;
      case 'niños':
        return <Baby className={`${iconSize} text-amber-600`} />;
      case 'adolescentes':
        return <Zap className={`${iconSize} text-purple-600`} />;
      case 'amigos':
        return <Users className={`${iconSize} text-emerald-600`} />;
      case 'herestauracion':
        return <User className={`${iconSize} text-orange-600`} />;
      case 'hermanos visitas':
        return <Users className={`${iconSize} text-indigo-600`} />;
      default:
        return <User className={`${iconSize} text-gray-600`} />;
    }
  };

  // Función para obtener el avatar con color de fondo según categoría
  const getCategoriaAvatar = (
    categoria: string,
    status?: 'asistente' | 'faltante'
  ) => {
    if (status === 'faltante') {
      return 'bg-red-100';
    }

    switch (categoria.toLowerCase()) {
      case 'hermanos':
        return 'bg-slate-100';
      case 'hermanas':
        return 'bg-rose-100';
      case 'niños':
        return 'bg-amber-100';
      case 'adolescentes':
        return 'bg-purple-100';
      case 'amigos':
        return 'bg-emerald-100';
      case 'herestauracion':
        return 'bg-orange-100';
      case 'hermanos visitas':
        return 'bg-indigo-100';
      default:
        return 'bg-gray-100';
    }
  };

  const handleConteoExport = async (format: 'csv' | 'excel' | 'pdf') => {
    if (!record) return;
    setIsExportingDetail(true);
    try {
      const totalesPorCategoria = [
        { label: 'Hermanos', value: record.hermanos },
        { label: 'Hermanas', value: record.hermanas },
        { label: 'Niños', value: record.ninos },
        { label: 'Adolescentes', value: record.adolescentes },
        { label: 'Amigos', value: record.amigos },
        { label: 'He. Restauración', value: record.heRestauracion || 0 },
        { label: 'H. Visitas', value: record.hermanosVisitas || 0 },
      ];

      const conteoInput: CountExportInput = {
        fecha: record.fecha,
        servicio: record.servicio,
        ujieres: Array.isArray(record.ujier)
          ? record.ujier.join(', ')
          : record.ujier,
        totalesPorCategoria,
        totalAsistentes: record.total,
        totalFaltantes: faltantes.length,
        asistentesCount: asistentes.length,
        faltantesCount: faltantes.length,
      };

      if (format === 'csv') {
        const csv = buildConteoCsv(conteoInput);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        downloadBlob(blob, generateConteoFilename(record.fecha, 'csv'));
      } else if (format === 'excel') {
        const buffer = await buildConteoWorkbook(conteoInput);
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        downloadBlob(blob, generateConteoFilename(record.fecha, 'xlsx'));
      } else {
        const { pdf } = await import('@react-pdf/renderer');
        const document = buildConteoPdfDocument(conteoInput);
        const blob = await pdf(document).toBlob();
        downloadBlob(blob, generateConteoFilename(record.fecha, 'pdf'));
      }
    } catch (error) {
      console.error('Error al exportar conteo:', error);
      toast.error('Error al generar el archivo de conteo');
    } finally {
      setIsExportingDetail(false);
    }
  };

  const handleDetailExport = async (
    action: DetailAction,
    format: 'excel' | 'pdf'
  ) => {
    if (!record) return;
    setIsExportingDetail(true);
    try {
      const asistentesRows: DetailExportRow[] = asistentes.map((a) => ({
        nombre: a.nombre,
        categoria: a.categoria,
        tipo: a.tipo,
        estado: 'Asistió',
      }));

      const faltantesRows: DetailExportRow[] = faltantes.map((f) => ({
        nombre: f.nombre,
        categoria: f.categoria_display || f.categoria,
        tipo: 'miembro',
        estado: 'Faltó',
      }));

      if (format === 'excel') {
        const buffer = await buildDetailWorkbook({
          asistentes: asistentesRows,
          faltantes: faltantesRows,
          action,
        });
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        downloadBlob(
          blob,
          generateDetailFilename(record.fecha, action, 'excel')
        );
      } else {
        const logoBase64 = await loadLogoBase64();
        const { pdf } = await import('@react-pdf/renderer');

        const totalesPorCategoria = [
          { label: 'Hermanos', value: record.hermanos },
          { label: 'Hermanas', value: record.hermanas },
          { label: 'Niños', value: record.ninos },
          { label: 'Adolescentes', value: record.adolescentes },
          { label: 'Amigos', value: record.amigos },
          { label: 'He. Restauración', value: record.heRestauracion || 0 },
          { label: 'H. Visitas', value: record.hermanosVisitas || 0 },
        ];

        const document = buildDetailPdfDocument({
          logoBase64,
          fecha: record.fecha,
          servicio: record.servicio,
          ujieres: Array.isArray(record.ujier)
            ? record.ujier.join(', ')
            : record.ujier,
          totalAsistentes: record.total,
          faltantesCount: faltantes.length,
          totalesPorCategoria,
          asistentes: asistentesRows,
          faltantes: faltantesRows,
          action,
        });

        const blob = await pdf(document).toBlob();
        downloadBlob(blob, generateDetailFilename(record.fecha, action, 'pdf'));
      }
    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error('Error al generar el archivo');
    } finally {
      setIsExportingDetail(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando detalles del servicio...</p>
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <AlertCircle className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">
              {error || 'Servicio no encontrado'}
            </p>
            <Button onClick={() => router.push('/historial')} variant="outline">
              Volver al Historial
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const asistentes = getAllAsistentes();
  const faltantes = getMiembrosFaltantes();
  const filteredData = getFilteredData();

  return (
    <div className="p-2 sm:p-4 space-y-4 sm:space-y-6 min-h-screen max-w-full overflow-x-hidden">
      {/* Header */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="px-3 sm:px-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/historial')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Historial
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/conteo?editId=${recordId}`)}
              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Editar en Conteo
            </Button>
          </div>
          <CardTitle className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            Servicio del{' '}
            {new Date(record.fecha + 'T12:00:00').toLocaleDateString('es-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Información del Servicio */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
        <CardContent className="p-4 space-y-4">
          {/* Vista de información */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Fecha:</span>
              <div className="font-semibold">
                {new Date(record.fecha + 'T12:00:00').toLocaleDateString(
                  'es-ES'
                )}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Servicio:</span>
              <div className="font-semibold">{record.servicio}</div>
            </div>
            <div>
              <span className="text-gray-600">Ujier(es):</span>
              <div className="font-semibold">
                {Array.isArray(record.ujier)
                  ? record.ujier.join(', ')
                  : record.ujier}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Total:</span>
              <div className="font-semibold text-xl text-slate-700">
                {record.total}
              </div>
            </div>
          </div>

          {/* Categorías detalladas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-3 border-t">
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="text-lg font-bold text-slate-600">
                {record.hermanos}
              </div>
              <div className="text-xs text-gray-500">Hermanos</div>
            </div>
            <div className="text-center p-3 bg-rose-50 rounded-lg">
              <div className="text-lg font-bold text-rose-600">
                {record.hermanas}
              </div>
              <div className="text-xs text-gray-500">Hermanas</div>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <div className="text-lg font-bold text-amber-600">
                {record.ninos}
              </div>
              <div className="text-xs text-gray-500">Niños</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">
                {record.adolescentes}
              </div>
              <div className="text-xs text-gray-500">Adolesc.</div>
            </div>
            <div className="text-center p-3 bg-emerald-50 rounded-lg">
              <div className="text-lg font-bold text-emerald-600">
                {record.amigos}
              </div>
              <div className="text-xs text-gray-500">Amigos</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-lg font-bold text-orange-600">
                {record.heRestauracion || 0}
              </div>
              <div className="text-xs text-gray-500">HeRest.</div>
            </div>
            <div className="text-center p-3 bg-indigo-50 rounded-lg">
              <div className="text-lg font-bold text-indigo-600">
                {record.hermanosVisitas || 0}
              </div>
              <div className="text-xs text-gray-500">H. Visitas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <UserCheck className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                Asistentes
              </span>
            </div>
            <div className="text-2xl font-bold text-green-700">
              {asistentes.length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <UserX className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-700">
                Faltantes
              </span>
            </div>
            <div className="text-2xl font-bold text-red-700">
              {faltantes.length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                Total Miembros
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-700">
              {allMembers.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Download className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Exportar</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isExportingDetail}
                className="bg-transparent border-green-200 text-green-700 hover:bg-green-50 text-xs"
              >
                {isExportingDetail ? (
                  <span className="animate-pulse">Exportando...</span>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Completa</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => handleDetailExport('completa', 'excel')}
                disabled={isExportingDetail}
              >
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDetailExport('completa', 'pdf')}
                disabled={isExportingDetail}
              >
                PDF
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel>Asistentes</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => handleDetailExport('asistentes', 'excel')}
                disabled={isExportingDetail}
              >
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDetailExport('asistentes', 'pdf')}
                disabled={isExportingDetail}
              >
                PDF
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel>Faltantes</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => handleDetailExport('faltantes', 'excel')}
                disabled={isExportingDetail}
              >
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDetailExport('faltantes', 'pdf')}
                disabled={isExportingDetail}
              >
                PDF
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel>Exportar Conteo</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => handleConteoExport('csv')}
                disabled={isExportingDetail}
              >
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleConteoExport('excel')}
                disabled={isExportingDetail}
              >
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleConteoExport('pdf')}
                disabled={isExportingDetail}
              >
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filtros</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>

            {/* Filtro por tipo */}
            <Select
              value={filterType}
              onValueChange={(value: unknown) =>
                setFilterType(value as 'all' | 'asistentes' | 'faltantes')
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="asistentes">Solo Asistentes</SelectItem>
                <SelectItem value="faltantes">Solo Faltantes</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro por categoría */}
            <Select value={filterCategoria} onValueChange={setFilterCategoria}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las Categorías</SelectItem>
                <SelectItem value="hermanos">Hermanos</SelectItem>
                <SelectItem value="hermanas">Hermanas</SelectItem>
                <SelectItem value="ninos">Niños</SelectItem>
                <SelectItem value="adolescentes">Adolescentes</SelectItem>
                <SelectItem value="amigos">Amigos</SelectItem>
                <SelectItem value="herestauracion">HeRestauracion</SelectItem>
                <SelectItem value="hermanos visitas">
                  Hermanos Visitas
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {filteredData.length} encontrados
            </Badge>
            {(searchTerm ||
              filterType !== 'all' ||
              filterCategoria !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setFilterCategoria('all');
                }}
                className="text-xs"
              >
                Limpiar Filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de personas */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Users className="w-4 h-4" />
            {filterType === 'asistentes'
              ? 'Asistentes'
              : filterType === 'faltantes'
                ? 'Miembros Faltantes'
                : 'Todos los Miembros'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {filteredData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No se encontraron resultados</p>
            </div>
          ) : (
            filteredData.map((person) => (
              <div
                key={person.id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                  person.status === 'faltante'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar con icono distintivo por categoría */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${getCategoriaAvatar(
                      person.categoria,
                      person.status
                    )}`}
                  >
                    {getCategoriaIcon(person.categoria, person.status)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-base">
                        {person.nombre}
                      </h3>
                      {/* Indicador pequeño de asistencia */}
                      <div
                        className={`w-3 h-3 rounded-full ${
                          person.status === 'faltante'
                            ? 'bg-red-400'
                            : 'bg-green-400'
                        }`}
                      />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={`text-xs font-medium ${getCategoriaColor(
                          person.categoria,
                          person.status
                        )}`}
                      >
                        {getCategoriaIcon(person.categoria, person.status)}
                        <span className="ml-1">{person.categoria}</span>
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          person.tipo === 'miembro'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}
                      >
                        {person.tipo === 'miembro' ? 'Miembro' : 'Amigo'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {person.status === 'faltante' ? (
                    <Badge
                      variant="outline"
                      className="bg-red-50 text-red-700 border-red-200 font-medium"
                    >
                      <UserX className="w-3 h-3 mr-1" />
                      Faltó
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 font-medium"
                    >
                      <UserCheck className="w-3 h-3 mr-1" />
                      Asistió
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
