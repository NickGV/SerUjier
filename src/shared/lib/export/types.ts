import type { HistorialRecord } from '@/shared/firebase/historial';

export type DetailAction = 'completa' | 'asistentes' | 'faltantes';
export type ExportFormat = 'excel' | 'pdf';

export interface DetailExportRow {
  nombre: string;
  categoria: string;
  tipo: 'miembro' | 'amigo';
  estado: 'Asistió' | 'Faltó';
}

export interface DetailWorkbookInput {
  asistentes: DetailExportRow[];
  faltantes: DetailExportRow[];
  action: DetailAction;
}

export interface ListExportRow extends HistorialRecord {
  heRestauracion: number;
  hermanosVisitas: number;
}

export interface ListStatsInput {
  totalRegistros: number;
  promedioAsistencia: number;
  mayorAsistencia: number;
  menorAsistencia: number;
  totalHermanos: number;
  totalHermanas: number;
  totalNinos: number;
  totalAdolescentes: number;
  totalAmigos: number;
  totalHeRestauracion: number;
  totalHermanosVisitas: number;
  granTotal: number;
}

export interface CategoryExportRow {
  categoria: string;
  cantidad: number;
  porcentaje: string;
}

export interface ListWorkbookInput {
  registros: Array<{
    fecha: string;
    diaSemana: string;
    servicio: string;
    ujieres: string;
    hermanos: number;
    hermanas: number;
    ninos: number;
    adolescentes: number;
    amigos: number;
    heRestauracion: number;
    hermanosVisitas: number;
    totalAsistentes: number;
    amigosAsistieron: string;
    hermanosAsistieron: string;
    hermanasAsistieron: string;
    ninosAsistieron: string;
    adolescentesAsistieron: string;
    heRestauracionAsistieron: string;
    hermanosVisitasAsistieron: string;
  }>;
  estadisticas: Array<{ concepto: string; valor: string | number }>;
  categorias: CategoryExportRow[];
}

export interface TotalsSummaryRow {
  label: string;
  value: number;
}

export interface ListPdfRecord {
  id: string;
  fecha: string;
  servicio: string;
  ujier: string | string[];
  hermanos: number;
  hermanas: number;
  ninos: number;
  adolescentes: number;
  amigos: number;
  heRestauracion?: number;
  hermanosVisitas?: number;
  total: number;
}

export interface ListPdfInput {
  logoBase64?: string | null;
  records: ListPdfRecord[];
  stats: ListStatsInput;
  titulo: string;
  filtroServicio: string;
  filtroFecha: string;
}

export interface CountExportInput {
  fecha: string;
  servicio: string;
  ujieres: string;
  totalesPorCategoria: TotalsSummaryRow[];
  totalAsistentes: number;
  totalFaltantes: number;
  asistentesCount: number;
  faltantesCount: number;
}

export const MAX_ROWS_PER_SHEET = 10_000;

export interface DetailPdfInput {
  logoBase64?: string | null;
  fecha: string;
  servicio: string;
  ujieres: string;
  totalAsistentes: number;
  faltantesCount: number;
  totalesPorCategoria: TotalsSummaryRow[];
  asistentes: DetailExportRow[];
  faltantes: DetailExportRow[];
  action: DetailAction;
}
