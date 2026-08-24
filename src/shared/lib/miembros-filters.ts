/**
 * Utility functions for filtering the miembros list
 */

import type { Miembro } from '@/shared/types';

/**
 * Membership filter values for the miembros list.
 * `todos` shows every row regardless of `esMiembro`.
 */
export type MembershipFilter = 'todos' | 'miembros' | 'no-miembros';

/**
 * Filters miembros rows by search term (case-insensitive match on `nombre`),
 * `categoria`, and membership status. Mirrors the inline filter previously
 * defined in `miembros/page.tsx` — extraction changes no behavior.
 */
export function filterMiembros(
  rows: Miembro[],
  search?: string,
  categoria?: string,
  membership: MembershipFilter = 'todos'
): Miembro[] {
  const searchTerm = (search ?? '').toLowerCase();
  const categoriaFilter = categoria ?? 'todos';

  return rows.filter((miembro) => {
    const nombreMatch = miembro.nombre.toLowerCase().includes(searchTerm);
    const categoriaMatch =
      categoriaFilter === 'todos' || miembro.categoria === categoriaFilter;
    const membershipMatch =
      membership === 'todos' ||
      (membership === 'miembros' ? miembro.esMiembro : !miembro.esMiembro);
    return nombreMatch && categoriaMatch && membershipMatch;
  });
}
