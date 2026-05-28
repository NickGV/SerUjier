import type { CountExportInput, DetailAction, ExportFormat } from './types';

const LOCALE = 'es-CO';
const TIME_ZONE = 'America/Bogota';

export function formatDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString(LOCALE, {
    timeZone: TIME_ZONE,
  });
}

export function formatDateLong(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString(LOCALE, {
    timeZone: TIME_ZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateTime(value: Date): string {
  return value.toLocaleString(LOCALE, {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generateDetailFilename(
  date: string,
  action: DetailAction,
  format: ExportFormat
): string {
  const actionLabel =
    action === 'completa'
      ? 'completo'
      : action === 'asistentes'
        ? 'asistentes'
        : 'faltantes';
  const extension = format === 'excel' ? 'xlsx' : 'pdf';
  return `informe_${date}_${actionLabel}.${extension}`;
}

export function generateListFilename(
  date: string,
  format: ExportFormat
): string {
  const extension = format === 'excel' ? 'xlsx' : 'pdf';
  return `informe_historial_${date}.${extension}`;
}

export function generateConteoFilename(
  date: string,
  extension: string
): string {
  return `informe_conteo_${date}.${extension}`;
}

export function buildConteoCsv(input: CountExportInput): string {
  const header = 'Concepto,Valor';
  const totals = input.totalesPorCategoria.map((r) => `${r.label},${r.value}`);
  const body = [
    ...totals,
    `Asistentes,${input.asistentesCount}`,
    `Faltantes,${input.faltantesCount}`,
  ];
  return [header, ...body].join('\n');
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function loadLogoBase64(): Promise<string | null> {
  try {
    const response = await fetch('/logo.png');
    if (!response.ok) {
      return null;
    }
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}
