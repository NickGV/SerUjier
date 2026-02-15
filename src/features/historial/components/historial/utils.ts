// Utility functions for history pages

import { type HistorialRecord } from '@/shared/firebase';

export interface CategoryStats {
  totalHermanos: number;
  totalHermanas: number;
  totalNinos: number;
  totalAdolescentes: number;
  totalSimpatizantes: number;
  totalheRestauracion: number;
  totalHermanosVisitas: number;
  granTotal: number;
}

export interface CategoryConfig {
  key: string;
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  textColor: string;
}

export const CATEGORIES: CategoryConfig[] = [
  {
    key: 'hermanos',
    label: 'Hermanos',
    shortLabel: 'H',
    color: 'slate',
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-600',
  },
  {
    key: 'hermanas',
    label: 'Hermanas',
    shortLabel: 'M',
    color: 'rose',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-600',
  },
  {
    key: 'ninos',
    label: 'Niños',
    shortLabel: 'N',
    color: 'amber',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
  },
  {
    key: 'adolescentes',
    label: 'Adolescentes',
    shortLabel: 'A',
    color: 'purple',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
  },
  {
    key: 'simpatizantes',
    label: 'Simpatizantes',
    shortLabel: 'S',
    color: 'emerald',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
  },
  {
    key: 'heRestauracion',
    label: 'Hermanos en Restauración',
    shortLabel: 'HA',
    color: 'orange',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
  },
  {
    key: 'hermanosVisitas',
    label: 'Hermanos Visitas',
    shortLabel: 'HV',
    color: 'indigo',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-600',
  },
];

export const calculateCategoryStats = (
  filteredData: HistorialRecord[]
): CategoryStats => {
  const totalHermanos = filteredData.reduce(
    (sum, record) => sum + record.hermanos,
    0
  );
  const totalHermanas = filteredData.reduce(
    (sum, record) => sum + record.hermanas,
    0
  );
  const totalNinos = filteredData.reduce(
    (sum, record) => sum + record.ninos,
    0
  );
  const totalAdolescentes = filteredData.reduce(
    (sum, record) => sum + record.adolescentes,
    0
  );
  const totalSimpatizantes = filteredData.reduce(
    (sum, record) => sum + record.simpatizantes,
    0
  );
  const totalheRestauracion = filteredData.reduce(
    (sum, record) => sum + (record.heRestauracion || 0),
    0
  );
  const totalHermanosVisitas = filteredData.reduce(
    (sum, record) => sum + (record.hermanosVisitas || 0),
    0
  );

  const granTotal =
    totalHermanos +
    totalHermanas +
    totalNinos +
    totalAdolescentes +
    totalSimpatizantes +
    totalheRestauracion +
    totalHermanosVisitas;

  return {
    totalHermanos,
    totalHermanas,
    totalNinos,
    totalAdolescentes,
    totalSimpatizantes,
    totalheRestauracion,
    totalHermanosVisitas,
    granTotal,
  };
};

export const getCategoryValue = (
  record: HistorialRecord,
  categoryKey: string
): number => {
  switch (categoryKey) {
    case 'hermanos':
      return record.hermanos;
    case 'hermanas':
      return record.hermanas;
    case 'ninos':
      return record.ninos;
    case 'adolescentes':
      return record.adolescentes;
    case 'simpatizantes':
      return record.simpatizantes;
    case 'heRestauracion':
      return record.heRestauracion || 0;
    case 'hermanosVisitas':
      return record.hermanosVisitas || 0;
    default:
      return 0;
  }
};

export const formatUjier = (ujier: string | string[]): string => {
  return Array.isArray(ujier) ? ujier.join(', ') : ujier;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString + 'T12:00:00').toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const formatDateShort = (dateString: string): string => {
  return new Date(dateString + 'T12:00:00').toLocaleDateString('es-ES');
};

export const getAttendeeNames = (
  attendees: Array<{ id: string; nombre: string }> | undefined
): string => {
  return attendees?.map((a) => a.nombre).join(', ') || '';
};

export const generateCSVHeaders = (): string[] => {
  return [
    'Fecha',
    'Servicio',
    'Ujier(es)',
    ...CATEGORIES.map((cat) => cat.label),
    'Total',
    'Simpatizantes Asistieron',
    'Hermanos Asistieron',
    'Hermanas Asistieron',
    'Niños Asistieron',
    'Adolescentes Asistieron',
    'Hermanos en Restauración Asistieron',
    'Hermanos Visitas Asistieron',
  ];
};

export const generateCSVRow = (record: HistorialRecord): string[] => {
  return [
    record.fecha,
    `"${record.servicio}"`,
    `"${formatUjier(record.ujier)}"`,
    ...CATEGORIES.map((cat) => getCategoryValue(record, cat.key).toString()),
    record.total.toString(),
    `"${getAttendeeNames(record.simpatizantesAsistieron)}"`,
    `"${getAttendeeNames(record.miembrosAsistieron?.hermanos)}"`,
    `"${getAttendeeNames(record.miembrosAsistieron?.hermanas)}"`,
    `"${getAttendeeNames(record.miembrosAsistieron?.ninos)}"`,
    `"${getAttendeeNames(record.miembrosAsistieron?.adolescentes)}"`,
    `"${getAttendeeNames(record.miembrosAsistieron?.heRestauracion)}"`,
    `"${getAttendeeNames(record.hermanosVisitasAsistieron)}"`,
  ];
};

export const generateExcelData = (record: HistorialRecord) => {
  const baseData: Record<string, string | number> = {
    Fecha: formatDateShort(record.fecha),
    'Día de la Semana': new Date(record.fecha + 'T12:00:00').toLocaleDateString(
      'es-ES',
      {
        weekday: 'long',
      }
    ),
    Servicio: record.servicio,
    'Ujier(es)': formatUjier(record.ujier),
    'Total Asistentes': record.total,
  };

  // Add category data
  CATEGORIES.forEach((cat) => {
    baseData[cat.label] = getCategoryValue(record, cat.key);
  });

  // Add attendee data
  baseData['Simpatizantes que Asistieron'] = getAttendeeNames(
    record.simpatizantesAsistieron
  );
  baseData['Hermanos que Asistieron'] = getAttendeeNames(
    record.miembrosAsistieron?.hermanos
  );
  baseData['Hermanas que Asistieron'] = getAttendeeNames(
    record.miembrosAsistieron?.hermanas
  );
  baseData['Niños que Asistieron'] = getAttendeeNames(
    record.miembrosAsistieron?.ninos
  );
  baseData['Adolescentes que Asistieron'] = getAttendeeNames(
    record.miembrosAsistieron?.adolescentes
  );
  baseData['Hermanos en Restauración que Asistieron'] = getAttendeeNames(
    record.miembrosAsistieron?.heRestauracion
  );
  baseData['Hermanos Visitas que Asistieron'] = getAttendeeNames(
    record.hermanosVisitasAsistieron
  );

  return baseData;
};

export const generateStatisticsData = (
  stats: CategoryStats,
  totalRegistros: number,
  promedioAsistencia: number,
  mayorAsistencia: number,
  menorAsistencia: number
) => {
  return [
    { Concepto: 'Total de Registros', Valor: totalRegistros },
    { Concepto: 'Promedio de Asistencia', Valor: promedioAsistencia },
    { Concepto: 'Mayor Asistencia', Valor: mayorAsistencia },
    { Concepto: 'Menor Asistencia', Valor: menorAsistencia },
    { Concepto: '', Valor: '' }, // Separador
    { Concepto: 'TOTALES POR CATEGORÍA', Valor: '' },
    { Concepto: 'Total Hermanos', Valor: stats.totalHermanos },
    { Concepto: 'Total Hermanas', Valor: stats.totalHermanas },
    { Concepto: 'Total Niños', Valor: stats.totalNinos },
    { Concepto: 'Total Adolescentes', Valor: stats.totalAdolescentes },
    { Concepto: 'Total Simpatizantes', Valor: stats.totalSimpatizantes },
    {
      Concepto: 'Total Hermanos en Restauración',
      Valor: stats.totalheRestauracion,
    },
    { Concepto: 'Total Hermanos Visitas', Valor: stats.totalHermanosVisitas },
    { Concepto: 'GRAN TOTAL', Valor: stats.granTotal },
  ];
};
