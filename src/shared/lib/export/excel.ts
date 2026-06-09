import type { Alignment, Fill, Font, Worksheet } from 'exceljs';
import {
  MAX_ROWS_PER_SHEET,
  type CountExportInput,
  type DetailExportRow,
  type DetailWorkbookInput,
  type ListWorkbookInput,
  type ListStatsInput,
} from './types';

export function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

const COLUMN_DEFS = [
  { header: 'Fecha', key: 'fecha', width: 14 },
  { header: 'Día de la Semana', key: 'diaSemana', width: 18 },
  { header: 'Servicio', key: 'servicio', width: 22 },
  { header: 'Ujier(es)', key: 'ujieres', width: 28 },
  { header: 'Hermanos', key: 'hermanos', width: 10 },
  { header: 'Hermanas', key: 'hermanas', width: 10 },
  { header: 'Niños', key: 'ninos', width: 10 },
  { header: 'Adolescentes', key: 'adolescentes', width: 12 },
  { header: 'Amigos', key: 'amigos', width: 10 },
  { header: 'He. Restauración', key: 'heRestauracion', width: 16 },
  { header: 'H. Visitas', key: 'hermanosVisitas', width: 14 },
  { header: 'Total Asistentes', key: 'totalAsistentes', width: 16 },
  {
    header: 'Amigos que Asistieron',
    key: 'amigosAsistieron',
    width: 42,
  },
  { header: 'Hermanos que Asistieron', key: 'hermanosAsistieron', width: 42 },
  { header: 'Hermanas que Asistieron', key: 'hermanasAsistieron', width: 42 },
  { header: 'Niños que Asistieron', key: 'ninosAsistieron', width: 42 },
  {
    header: 'Adolescentes que Asistieron',
    key: 'adolescentesAsistieron',
    width: 42,
  },
  {
    header: 'He. Restauración que Asistieron',
    key: 'heRestauracionAsistieron',
    width: 42,
  },
  {
    header: 'H. Visitas que Asistieron',
    key: 'hermanosVisitasAsistieron',
    width: 42,
  },
];

const HEADER_FILL: Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF4472C4' },
};

const HEADER_FONT: Partial<Font> = {
  bold: true,
  color: { argb: 'FFFFFFFF' },
};

const HEADER_ALIGNMENT: Partial<Alignment> = {
  vertical: 'middle',
  horizontal: 'left',
};

const STATUS_ALIGNMENT: Partial<Alignment> = {
  horizontal: 'center',
};

export async function buildDetailWorkbook(
  input: DetailWorkbookInput
): Promise<ArrayBuffer> {
  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();

  if (input.action === 'completa' || input.action === 'asistentes') {
    const sheet = workbook.addWorksheet('Asistentes');
    addDetailSheet(sheet, input.asistentes, 'Asistió');
  }

  if (input.action === 'completa' || input.action === 'faltantes') {
    const sheet = workbook.addWorksheet('Faltantes');
    addDetailSheet(sheet, input.faltantes, 'Faltó');
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as ArrayBuffer;
}

export async function buildConteoWorkbook(
  input: CountExportInput
): Promise<ArrayBuffer> {
  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Conteo');

  // Title row
  sheet.mergeCells('A1:B1');
  const titleRow = sheet.getRow(1);
  titleRow.getCell(1).value = `Conteo — ${input.fecha}`;
  titleRow.font = { bold: true, size: 12 };
  titleRow.commit();

  // Metadata
  const meta = [
    { header: 'Servicio', value: input.servicio },
    { header: 'Ujier(es)', value: input.ujieres },
    { header: 'Total Asistentes', value: input.totalAsistentes },
    { header: 'Faltantes', value: input.totalFaltantes },
  ];
  meta.forEach((m) => sheet.addRow({ concepto: m.header, valor: m.value }));

  // Category totals section
  const emptyRow = sheet.addRow({ concepto: '', valor: '' });
  sheet.addRow({ concepto: 'TOTALES POR CATEGORÍA', valor: '' });
  sheet.mergeCells(`A${emptyRow.number + 1}:B${emptyRow.number + 1}`);
  const sectionHeader = sheet.getRow(emptyRow.number + 1);
  sectionHeader.font = { bold: true };

  input.totalesPorCategoria.forEach((t) =>
    sheet.addRow({ concepto: t.label, valor: t.value })
  );

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as ArrayBuffer;
}

export async function buildListWorkbook(
  input: ListWorkbookInput,
  stats: ListStatsInput,
  maxRowsPerSheet = MAX_ROWS_PER_SHEET
): Promise<ArrayBuffer> {
  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();

  const chunks = chunkArray(input.registros, maxRowsPerSheet);
  if (chunks.length === 0) {
    // Create a header-only sheet for empty results
    const sheet = workbook.addWorksheet('Registros Detallados');
    sheet.columns = COLUMN_DEFS;
    styleHeader(sheet, 0, 'U');
  } else {
    chunks.forEach((chunk, index) => {
      const sheetName =
        index === 0
          ? 'Registros Detallados'
          : `Registros Detallados (parte ${index + 1})`;
      const sheet = workbook.addWorksheet(sheetName);
      sheet.columns = COLUMN_DEFS;
      chunk.forEach((row) => sheet.addRow(row));
      styleHeader(sheet, chunk.length, 'U');
    });
  }

  const estadisticasSheet = workbook.addWorksheet('Estadísticas');
  estadisticasSheet.columns = [
    { header: 'Concepto', key: 'concepto', width: 30 },
    { header: 'Valor', key: 'valor', width: 16 },
  ];

  estadisticasSheet.addRow({
    concepto: 'TOTALES POR CATEGORÍA',
    valor: '',
  });
  estadisticasSheet.mergeCells('A1:B1');
  const statsHeader = estadisticasSheet.getRow(1);
  statsHeader.font = { bold: true };
  statsHeader.alignment = { horizontal: 'center' };
  statsHeader.commit();

  input.estadisticas.forEach((row) => estadisticasSheet.addRow(row));
  styleHeader(estadisticasSheet, input.estadisticas.length + 1, 'B');

  const categoriasSheet = workbook.addWorksheet('Categorías');
  categoriasSheet.columns = [
    { header: 'Categoría', key: 'categoria', width: 22 },
    { header: 'Cantidad', key: 'cantidad', width: 14 },
    { header: 'Porcentaje', key: 'porcentaje', width: 14 },
  ];
  input.categorias.forEach((row) => categoriasSheet.addRow(row));
  styleHeader(categoriasSheet, input.categorias.length, 'C');

  if (stats.granTotal > 0) {
    categoriasSheet.getColumn('C').numFmt = '0.0%';
    categoriasSheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const cell = row.getCell(3);
        const raw = (row.getCell(2).value as number) / stats.granTotal;
        cell.value = Number.isFinite(raw) ? raw : 0;
      }
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as ArrayBuffer;
}

function addDetailSheet(
  sheet: Worksheet,
  rows: DetailExportRow[],
  statusLabel: 'Asistió' | 'Faltó'
) {
  sheet.columns = [
    { header: 'Nombre', key: 'nombre', width: 30 },
    { header: 'Categoría', key: 'categoria', width: 18 },
    { header: 'Tipo', key: 'tipo', width: 22 },
    { header: 'Estado', key: 'estado', width: 14 },
  ];

  rows.forEach((row) =>
    sheet.addRow({
      ...row,
      estado: statusLabel,
    })
  );

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.getCell(4).alignment = STATUS_ALIGNMENT;
    }
  });

  styleHeader(sheet, rows.length, 'D');
}

function styleHeader(sheet: Worksheet, rowCount: number, lastColumn: string) {
  const headerRow = sheet.getRow(1);
  headerRow.font = HEADER_FONT;
  headerRow.fill = HEADER_FILL;
  headerRow.alignment = HEADER_ALIGNMENT;
  headerRow.commit();

  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  sheet.autoFilter = {
    from: 'A1',
    to: `${lastColumn}${Math.max(rowCount + 1, 1)}`,
  };
}
