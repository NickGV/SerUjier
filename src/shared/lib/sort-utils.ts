/**
 * Utility functions for sorting arrays alphabetically
 */

/**
 * Sorts an array of strings alphabetically (A-Z)
 * Case-insensitive sorting
 */
export function sortAlphabetically(items: string[]): string[] {
  return [...items].sort((a, b) =>
    a.localeCompare(b, 'es', { sensitivity: 'base' })
  );
}

/**
 * Sorts an array of objects by a string property alphabetically (A-Z)
 * Case-insensitive sorting
 */
export function sortByProperty<T>(items: T[], property: keyof T): T[] {
  return [...items].sort((a, b) => {
    const aValue = String(a[property]);
    const bValue = String(b[property]);
    return aValue.localeCompare(bValue, 'es', { sensitivity: 'base' });
  });
}

/**
 * Sorts an array of objects by the 'nombre' property alphabetically (A-Z)
 * This is a convenience function for the most common use case
 */
export function sortByNombre<T extends { nombre: string }>(items: T[]): T[] {
  return sortByProperty(items, 'nombre');
}
