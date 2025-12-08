import { type ConteoState } from './types';
import { type DatosServicioBase } from '@/shared/types';

/**
 * Interface for calculated totals by category
 */
export interface CategoryTotals {
  hermanos: number;
  hermanas: number;
  ninos: number;
  adolescentes: number;
  simpatizantes: number;
  hermanosApartados: number;
  hermanosVisitas: number;
  total: number;
}

/**
 * Interface for base values in consecutive mode
 */
interface BaseValues {
  hermanos: number;
  hermanas: number;
  ninos: number;
  adolescentes: number;
  simpatizantes: number;
  hermanosApartados: number;
  hermanosVisitas: number;
}

/**
 * Calculates the total for a specific category
 * @param counterValue - Manual counter value
 * @param miembrosDelDiaLength - Number of individually added members/sympathizers
 * @param baseValue - Base value from previous service (consecutive mode)
 */
export function calculateCategoryTotal(
  counterValue: number,
  miembrosDelDiaLength: number,
  baseValue: number = 0
): number {
  return counterValue + miembrosDelDiaLength + baseValue;
}

/**
 * Gets base values for consecutive mode
 */
function getBaseValues(
  modoConsecutivo: boolean,
  datosServicioBase: DatosServicioBase | null
): BaseValues {
  if (!modoConsecutivo || !datosServicioBase) {
    return {
      hermanos: 0,
      hermanas: 0,
      ninos: 0,
      adolescentes: 0,
      simpatizantes: 0,
      hermanosApartados: 0,
      hermanosVisitas: 0,
    };
  }

  return {
    hermanos: datosServicioBase.hermanos || 0,
    hermanas: datosServicioBase.hermanas || 0,
    ninos: datosServicioBase.ninos || 0,
    adolescentes: datosServicioBase.adolescentes || 0,
    simpatizantes: datosServicioBase.simpatizantes || 0,
    hermanosApartados: datosServicioBase.hermanosApartados || 0,
    hermanosVisitas: datosServicioBase.hermanosVisitas || 0,
  };
}

/**
 * Calculates all attendance totals
 * @param conteoState - Current counting state
 * @param datosServicioBase - Base service data (for consecutive mode)
 * @returns Object with all calculated totals
 */
export function calculateAllTotals(
  conteoState: ConteoState,
  datosServicioBase: DatosServicioBase | null
): CategoryTotals {
  const baseValues = getBaseValues(
    conteoState.modoConsecutivo,
    datosServicioBase
  );

  const hermanos = calculateCategoryTotal(
    conteoState.hermanos,
    conteoState.hermanosDelDia.length,
    baseValues.hermanos
  );

  const hermanas = calculateCategoryTotal(
    conteoState.hermanas,
    conteoState.hermanasDelDia.length,
    baseValues.hermanas
  );

  const ninos = calculateCategoryTotal(
    conteoState.ninos,
    conteoState.ninosDelDia.length,
    baseValues.ninos
  );

  const adolescentes = calculateCategoryTotal(
    conteoState.adolescentes,
    conteoState.adolescentesDelDia.length,
    baseValues.adolescentes
  );

  const simpatizantes = calculateCategoryTotal(
    conteoState.simpatizantesCount,
    conteoState.simpatizantesDelDia.length,
    baseValues.simpatizantes
  );

  const hermanosApartados = calculateCategoryTotal(
    conteoState.hermanosApartados,
    conteoState.hermanosApartadosDelDia.length,
    baseValues.hermanosApartados
  );

  const hermanosVisitas = calculateCategoryTotal(
    conteoState.hermanosVisitasCount,
    conteoState.hermanosVisitasDelDia.length,
    baseValues.hermanosVisitas
  );

  const total =
    hermanos +
    hermanas +
    ninos +
    adolescentes +
    simpatizantes +
    hermanosApartados +
    hermanosVisitas;

  return {
    hermanos,
    hermanas,
    ninos,
    adolescentes,
    simpatizantes,
    hermanosApartados,
    hermanosVisitas,
    total,
  };
}

/**
 * Builds arrays of attendees to save in Firebase
 */
function buildAsistentesArrays(
  conteoState: ConteoState,
  datosServicioBase: DatosServicioBase | null
) {
  const baseSimpatizantes = conteoState.modoConsecutivo
    ? datosServicioBase?.simpatizantesAsistieron || []
    : [];

  const baseMiembros = conteoState.modoConsecutivo
    ? datosServicioBase?.miembrosAsistieron || {
        hermanos: [],
        hermanas: [],
        ninos: [],
        adolescentes: [],
        hermanosApartados: [],
      }
    : {
        hermanos: [],
        hermanas: [],
        ninos: [],
        adolescentes: [],
        hermanosApartados: [],
      };

  const baseHermanosVisitas = conteoState.modoConsecutivo
    ? datosServicioBase?.hermanosVisitasAsistieron || []
    : [];

  return {
    simpatizantesAsistieron: [
      ...baseSimpatizantes,
      ...conteoState.simpatizantesDelDia.map((s) => ({
        id: s.id,
        nombre: s.nombre,
      })),
    ],
    miembrosAsistieron: {
      hermanos: [
        ...baseMiembros.hermanos,
        ...conteoState.hermanosDelDia.map((m) => ({
          id: m.id,
          nombre: m.nombre,
        })),
      ],
      hermanas: [
        ...baseMiembros.hermanas,
        ...conteoState.hermanasDelDia.map((m) => ({
          id: m.id,
          nombre: m.nombre,
        })),
      ],
      ninos: [
        ...baseMiembros.ninos,
        ...conteoState.ninosDelDia.map((m) => ({
          id: m.id,
          nombre: m.nombre,
        })),
      ],
      adolescentes: [
        ...baseMiembros.adolescentes,
        ...conteoState.adolescentesDelDia.map((m) => ({
          id: m.id,
          nombre: m.nombre,
        })),
      ],
      hermanosApartados: [
        ...baseMiembros.hermanosApartados,
        ...conteoState.hermanosApartadosDelDia.map((m) => ({
          id: m.id,
          nombre: m.nombre,
        })),
      ],
    },
    hermanosVisitasAsistieron: [
      ...baseHermanosVisitas,
      ...conteoState.hermanosVisitasDelDia.map((h) => ({
        id: h.id,
        nombre: h.nombre,
        iglesia: h.iglesia,
      })),
    ],
  };
}

/**
 * Type for the complete data object saved to Firebase
 */
export interface ConteoDataResult {
  fecha: string;
  servicio: string;
  ujier: string[];
  hermanos: number;
  hermanas: number;
  ninos: number;
  adolescentes: number;
  simpatizantes: number;
  hermanosApartados: number;
  hermanosVisitas: number;
  total: number;
  simpatizantesAsistieron: Array<{ id: string; nombre: string }>;
  miembrosAsistieron: {
    hermanos: Array<{ id: string; nombre: string }>;
    hermanas: Array<{ id: string; nombre: string }>;
    ninos: Array<{ id: string; nombre: string }>;
    adolescentes: Array<{ id: string; nombre: string }>;
    hermanosApartados: Array<{ id: string; nombre: string }>;
  };
  hermanosVisitasAsistieron: Array<{
    id: string;
    nombre: string;
    iglesia?: string;
  }>;
}

/**
 * Builds the complete data object to save the count
 * @param totals - Calculated totals
 * @param conteoState - Current counting state
 * @param servicios - Array of available services
 * @param datosServicioBase - Base service data (for consecutive mode)
 * @param selectedUjieres - Array of selected ushers
 * @returns Complete object ready to save to Firebase
 */
export function buildConteoData(
  totals: CategoryTotals,
  conteoState: ConteoState,
  servicios: Array<{ value: string; label: string }>,
  datosServicioBase: DatosServicioBase | null,
  selectedUjieres: string[]
): ConteoDataResult {
  const asistentes = buildAsistentesArrays(conteoState, datosServicioBase);

  return {
    fecha: conteoState.fecha,
    servicio:
      servicios.find((s) => s.value === conteoState.tipoServicio)?.label ||
      conteoState.tipoServicio,
    ujier: selectedUjieres,
    hermanos: totals.hermanos,
    hermanas: totals.hermanas,
    ninos: totals.ninos,
    adolescentes: totals.adolescentes,
    simpatizantes: totals.simpatizantes,
    hermanosApartados: totals.hermanosApartados,
    hermanosVisitas: totals.hermanosVisitas,
    total: totals.total,
    ...asistentes,
  };
}
