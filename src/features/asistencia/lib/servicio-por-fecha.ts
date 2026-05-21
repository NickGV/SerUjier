/**
 * Devuelve el `tipoServicio` sugerido para una fecha local (`YYYY-MM-DD`).
 *
 * Mapeo por día de la semana:
 * - Martes  → intercesion
 * - Jueves  → oracion (Oración y Enseñanza)
 * - Sábado  → jovenes
 * - Domingo → evangelismo
 * - Resto   → dominical
 *
 * Se usa `T12:00:00` para evitar saltos de día por zona horaria.
 */
export function getServicioPorFecha(fecha: string): string {
  if (!fecha) return 'dominical';

  const date = new Date(`${fecha}T12:00:00`);
  if (Number.isNaN(date.getTime())) return 'dominical';

  switch (date.getDay()) {
    case 2:
      return 'intercesion';
    case 4:
      return 'oracion';
    case 6:
      return 'jovenes';
    case 0:
      return 'evangelismo';
    default:
      return 'dominical';
  }
}
