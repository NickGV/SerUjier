/**
 * Utility functions for counting calculations
 * Handles the logic for calculating manual counters vs named attendees
 */

export interface HistorialDataForCalculation {
  hermanos: number;
  hermanas: number;
  ninos: number;
  adolescentes: number;
  simpatizantes: number;
  visitas?: number;
  heRestauracion?: number;
  hermanosVisitas?: number;
  simpatizantesAsistieron?: Array<{ id: string; nombre: string }>;
  visitasAsistieron?: Array<{ id: string; nombre: string }>;
  miembrosAsistieron?: {
    hermanos?: Array<{ id: string; nombre: string }>;
    hermanas?: Array<{ id: string; nombre: string }>;
    ninos?: Array<{ id: string; nombre: string }>;
    adolescentes?: Array<{ id: string; nombre: string }>;
    heRestauracion?: Array<{ id: string; nombre: string }>;
  };
  hermanosVisitasAsistieron?: Array<{
    id: string;
    nombre: string;
    iglesia?: string;
  }>;
}

export interface ManualCounters {
  hermanos: number;
  hermanas: number;
  ninos: number;
  adolescentes: number;
  simpatizantes: number;
  visitas: number;
  heRestauracion: number;
  hermanosVisitas: number;
}

/**
 * Calculates manual counters (those without associated names)
 * These are the ones added with the + button without using dialogs
 *
 * @param historialData - Data from history record
 * @returns Object with manual counter values for each category
 */
export function calculateManualCounters(
  historialData: HistorialDataForCalculation
): ManualCounters {
  // Count how many have names
  const hermanosConNombre =
    historialData.miembrosAsistieron?.hermanos?.length || 0;
  const hermanasConNombre =
    historialData.miembrosAsistieron?.hermanas?.length || 0;
  const ninosConNombre = historialData.miembrosAsistieron?.ninos?.length || 0;
  const adolescentesConNombre =
    historialData.miembrosAsistieron?.adolescentes?.length || 0;
  const simpatizantesConNombre =
    historialData.simpatizantesAsistieron?.length || 0;
  const visitasConNombre = historialData.visitasAsistieron?.length || 0;
  const heRestauracionConNombre =
    historialData.miembrosAsistieron?.heRestauracion?.length || 0;
  const hermanosVisitasConNombre =
    historialData.hermanosVisitasAsistieron?.length || 0;

  // Manual counters are the difference between total and those with names
  return {
    hermanos: Math.max(0, historialData.hermanos - hermanosConNombre),
    hermanas: Math.max(0, historialData.hermanas - hermanasConNombre),
    ninos: Math.max(0, historialData.ninos - ninosConNombre),
    adolescentes: Math.max(
      0,
      historialData.adolescentes - adolescentesConNombre
    ),
    simpatizantes: Math.max(
      0,
      historialData.simpatizantes - simpatizantesConNombre
    ),
    visitas: Math.max(0, (historialData.visitas || 0) - visitasConNombre),
    heRestauracion: Math.max(
      0,
      (historialData.heRestauracion || 0) - heRestauracionConNombre
    ),
    hermanosVisitas: Math.max(
      0,
      (historialData.hermanosVisitas || 0) - hermanosVisitasConNombre
    ),
  };
}

/**
 * Calculates total attendance from counters and named attendees
 *
 * @param counters - Manual counter values
 * @param namedAttendees - Object with arrays of named attendees per category
 * @returns Total attendance count
 */
export function calculateTotalAttendance(
  counters: ManualCounters,
  namedAttendees: {
    simpatizantes: number;
    visitas: number;
    hermanos: number;
    hermanas: number;
    ninos: number;
    adolescentes: number;
    heRestauracion: number;
    hermanosVisitas: number;
  }
): number {
  return (
    counters.hermanos +
    counters.hermanas +
    counters.ninos +
    counters.adolescentes +
    counters.simpatizantes +
    counters.visitas +
    counters.heRestauracion +
    counters.hermanosVisitas +
    namedAttendees.simpatizantes +
    namedAttendees.visitas +
    namedAttendees.hermanos +
    namedAttendees.hermanas +
    namedAttendees.ninos +
    namedAttendees.adolescentes +
    namedAttendees.heRestauracion +
    namedAttendees.hermanosVisitas
  );
}

/**
 * Validates that counter values are non-negative
 *
 * @param counters - Counter values to validate
 * @returns True if all counters are valid (>= 0)
 */
export function validateCounters(counters: ManualCounters): boolean {
  return Object.values(counters).every((value) => value >= 0);
}

/**
 * Gets the sum of all counters
 *
 * @param counters - Counter values
 * @returns Sum of all counter values
 */
export function sumCounters(counters: ManualCounters): number {
  return Object.values(counters).reduce((sum, value) => sum + value, 0);
}
