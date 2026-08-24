import {
  filterMiembros,
  type MembershipFilter,
} from '@/shared/lib/miembros-filters';
import type { Miembro } from '@/shared/types';

function makeMiembro(overrides: Partial<Miembro> & { id: string }): Miembro {
  return {
    nombre: 'Default',
    categoria: 'hermano',
    esMiembro: false,
    ...overrides,
  };
}

const rows: Miembro[] = [
  makeMiembro({
    id: '1',
    nombre: 'Ana Hermano',
    categoria: 'hermano',
    esMiembro: true,
  }),
  makeMiembro({
    id: '2',
    nombre: 'Beto Hermano',
    categoria: 'hermano',
    esMiembro: false,
  }),
  makeMiembro({
    id: '3',
    nombre: 'Carla Nino',
    categoria: 'nino',
    esMiembro: true,
  }),
  makeMiembro({
    id: '4',
    nombre: 'Diego Nino',
    categoria: 'nino',
    esMiembro: false,
  }),
  makeMiembro({
    id: '5',
    nombre: 'Elena Adolescente',
    categoria: 'adolescente',
    esMiembro: true,
  }),
  makeMiembro({
    id: '6',
    nombre: 'Fede Adolescente',
    categoria: 'adolescente',
    esMiembro: false,
  }),
];

describe('filterMiembros', () => {
  const cases: Array<{
    membership: MembershipFilter;
    categoria: string;
    expectedIds: string[];
  }> = [
    { membership: 'todos', categoria: 'hermano', expectedIds: ['1', '2'] },
    { membership: 'todos', categoria: 'nino', expectedIds: ['3', '4'] },
    {
      membership: 'todos',
      categoria: 'adolescente',
      expectedIds: ['5', '6'],
    },
    { membership: 'miembros', categoria: 'hermano', expectedIds: ['1'] },
    { membership: 'miembros', categoria: 'nino', expectedIds: ['3'] },
    { membership: 'miembros', categoria: 'adolescente', expectedIds: ['5'] },
    { membership: 'no-miembros', categoria: 'hermano', expectedIds: ['2'] },
    { membership: 'no-miembros', categoria: 'nino', expectedIds: ['4'] },
    {
      membership: 'no-miembros',
      categoria: 'adolescente',
      expectedIds: ['6'],
    },
  ];

  it.each(cases)(
    'membership=$membership categoria=$categoria returns $expectedIds',
    ({ membership, categoria, expectedIds }) => {
      const result = filterMiembros(rows, undefined, categoria, membership);
      expect(result.map((r) => r.id)).toEqual(expectedIds);
    }
  );

  it('defaults to todos categoria and todos membership when omitted', () => {
    const result = filterMiembros(rows);
    expect(result).toHaveLength(rows.length);
  });

  it('matches nombre case-insensitively when a search term is given', () => {
    const result = filterMiembros(rows, 'ana');
    expect(result.map((r) => r.id)).toEqual(['1']);
  });

  it('combines search, categoria, and membership filters', () => {
    const result = filterMiembros(rows, 'nino', 'nino', 'miembros');
    expect(result.map((r) => r.id)).toEqual(['3']);
  });

  it('returns an empty array when no row matches the search term', () => {
    const result = filterMiembros(rows, 'zzz');
    expect(result).toEqual([]);
  });

  it('does not mutate the original array', () => {
    filterMiembros(rows, undefined, 'hermano', 'miembros');
    expect(rows).toHaveLength(6);
  });
});
