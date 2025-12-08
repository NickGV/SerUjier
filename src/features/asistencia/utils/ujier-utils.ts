/**
 * Utility functions for handling ujier (usher) data
 * Normalizes and formats ujier information
 */

/**
 * Normalizes ujier data to always be an array
 *
 * @param ujier - Ujier data that can be string or array
 * @returns Array of ujier names
 */
export function normalizeUjieres(ujier: string | string[]): string[] {
  return Array.isArray(ujier) ? ujier : [ujier];
}

/**
 * Formats ujier array for display
 *
 * @param ujier - Ujier data that can be string or array
 * @returns Formatted string with ujier names
 */
export function formatUjieres(ujier: string | string[]): string {
  const ujieresArray = normalizeUjieres(ujier);
  return ujieresArray.join(", ");
}

/**
 * Determines the ujier selector value based on ujier data
 *
 * @param ujier - Ujier data that can be string or array
 * @returns "otro" if multiple ujieres, otherwise the ujier name
 */
export function getUjierSelectorValue(ujier: string | string[]): string {
  const ujieresArray = normalizeUjieres(ujier);
  return ujieresArray.length === 1 ? ujieresArray[0] : "otro";
}

/**
 * Gets the custom ujier string for multiple ujieres
 *
 * @param ujier - Ujier data that can be string or array
 * @returns Empty string if single ujier, otherwise comma-separated names
 */
export function getCustomUjierString(ujier: string | string[]): string {
  const ujieresArray = normalizeUjieres(ujier);
  return ujieresArray.length > 1 ? ujieresArray.join(", ") : "";
}

/**
 * Validates that at least one ujier is selected
 *
 * @param selectedUjieres - Array of selected ujier names
 * @returns True if at least one ujier is selected
 */
export function validateUjieres(selectedUjieres: string[]): boolean {
  return selectedUjieres.length > 0;
}

/**
 * Filters active ujieres from the full list
 *
 * @param ujieres - Array of ujier objects with activo property
 * @returns Array of active ujier names, sorted alphabetically
 */
export function getActiveUjieres<T extends { activo: boolean; nombre: string }>(
  ujieres: T[],
): string[] {
  return ujieres
    .filter((ujier) => ujier.activo)
    .map((ujier) => ujier.nombre)
    .sort();
}
