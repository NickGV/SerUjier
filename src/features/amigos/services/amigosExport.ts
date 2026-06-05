'use client';

import { type Amigo } from '@/types/amigos';

/**
 * Formats a date string for CSV output
 */
function formatDate(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Escapes a CSV field value to handle commas, quotes, and newlines
 */
function escapeCSV(value: string): string {
  if (!value) return '';
  // If the value contains commas, quotes, or newlines, wrap it in quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Exports the amigos list to a downloadable CSV file
 * @param amigos - Array of Amigo objects to export
 */
export function exportAmigosToCSV(amigos: Amigo[]): void {
  // Define CSV columns
  const headers = [
    'Nombre',
    'Teléfono',
    'Notas',
    'Fecha de Registro',
    'Origen',
  ];

  // Build CSV rows
  const rows = amigos.map((amigo) =>
    [
      escapeCSV(amigo.nombre),
      escapeCSV(amigo.telefono || ''),
      escapeCSV(amigo.notas || ''),
      formatDate(amigo.fechaRegistro),
      amigo.migratedFrom
        ? amigo.migratedFrom.charAt(0).toUpperCase() +
          amigo.migratedFrom.slice(1)
        : 'Directo',
    ].join(',')
  );

  // Combine headers and rows
  const csvContent = [headers.join(','), ...rows].join('\n');

  // Create BOM for Excel compatibility with Spanish characters
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute(
    'download',
    `amigos_${new Date().toISOString().split('T')[0]}.csv`
  );

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
