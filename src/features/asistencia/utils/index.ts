/**
 * Asistencia (Attendance) utilities
 * Centralized export for all utility functions
 */

export {
  calculateManualCounters,
  calculateTotalAttendance,
  validateCounters,
  sumCounters,
  type HistorialDataForCalculation,
  type ManualCounters,
} from "./conteo-calculations";

export {
  normalizeUjieres,
  formatUjieres,
  getUjierSelectorValue,
  getCustomUjierString,
  validateUjieres,
  getActiveUjieres,
} from "./ujier-utils";
