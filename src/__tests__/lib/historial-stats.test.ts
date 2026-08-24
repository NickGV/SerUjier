import {
  buildAmigosSeguimiento,
  collectMiembroAttendeeIds,
  computeServicioAverages,
  computeTopFaltantes,
  filterRecordsByDateRange,
  normalizeHistorialRecord,
  todayISODate,
  toEpochDay,
  type HistorialRecordRaw,
  type MiembroLike,
} from '@/shared/lib/historial-stats';

describe('normalizeHistorialRecord', () => {
  it('resolves the legacy simpatizantes -> amigos fallback and counts it downstream', () => {
    const record = normalizeHistorialRecord({
      fecha: '2026-01-01',
      servicio: 'dominical',
      total: 10,
      simpatizantes: 3,
      simpatizantesAsistieron: [{ id: 'a1', nombre: 'Ana' }],
    });

    expect(record.amigos).toBe(3);
    expect(record.amigosAsistieron).toEqual([{ id: 'a1', nombre: 'Ana' }]);
  });

  it('falls back to visitasAsistieron when neither amigosAsistieron nor simpatizantesAsistieron exist', () => {
    const record = normalizeHistorialRecord({
      fecha: '2026-01-01',
      servicio: 'dominical',
      total: 10,
      visitasAsistieron: [{ id: 'v1', nombre: 'Vic' }],
    });

    expect(record.amigosAsistieron).toEqual([{ id: 'v1', nombre: 'Vic' }]);
  });

  it('prefers current amigos/amigosAsistieron fields over legacy ones when both exist', () => {
    const record = normalizeHistorialRecord({
      fecha: '2026-01-01',
      servicio: 'dominical',
      total: 10,
      amigos: 5,
      simpatizantes: 3,
      amigosAsistieron: [{ id: 'a1', nombre: 'Ana' }],
      simpatizantesAsistieron: [{ id: 's1', nombre: 'Sim' }],
    });

    expect(record.amigos).toBe(5);
    expect(record.amigosAsistieron).toEqual([{ id: 'a1', nombre: 'Ana' }]);
  });

  it('defaults amigos, heRestauracion, hermanosVisitas and amigosAsistieron when nothing is present', () => {
    const record = normalizeHistorialRecord({
      fecha: '2026-01-01',
      servicio: 'dominical',
      total: 10,
    });

    expect(record.amigos).toBe(0);
    expect(record.heRestauracion).toBe(0);
    expect(record.hermanosVisitas).toBe(0);
    expect(record.amigosAsistieron).toEqual([]);
  });

  it('preserves unrelated fields via the spread', () => {
    const record = normalizeHistorialRecord({
      fecha: '2026-01-01',
      servicio: 'dominical',
      total: 10,
      hermanosVisitasAsistieron: [{ id: 'h1', nombre: 'Hno' }],
    });

    expect(record.hermanosVisitasAsistieron).toEqual([
      { id: 'h1', nombre: 'Hno' },
    ]);
  });
});

describe('todayISODate', () => {
  it('formats a given date as local YYYY-MM-DD', () => {
    expect(todayISODate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('pads single-digit months and days', () => {
    expect(todayISODate(new Date(2026, 8, 9))).toBe('2026-09-09');
  });

  it('never shifts to the next UTC day for a late-evening local time', () => {
    // 23:30 local time must still report the same local calendar day.
    expect(todayISODate(new Date(2026, 5, 15, 23, 30))).toBe('2026-06-15');
  });
});

describe('toEpochDay', () => {
  it('parses a valid YYYY-MM-DD date', () => {
    expect(toEpochDay('2026-01-01')).not.toBeNull();
  });

  it('increases by exactly 1 for consecutive days', () => {
    const day1 = toEpochDay('2026-03-10');
    const day2 = toEpochDay('2026-03-11');
    expect(day2! - day1!).toBe(1);
  });

  it('returns null for an unparseable string', () => {
    expect(toEpochDay('not-a-date')).toBeNull();
    expect(toEpochDay('')).toBeNull();
    expect(toEpochDay('2026/01/01')).toBeNull();
  });

  it('returns null for an invalid calendar date', () => {
    expect(toEpochDay('2024-02-30')).toBeNull();
  });
});

describe('filterRecordsByDateRange', () => {
  const rows = [
    { fecha: '2026-01-01', label: 'a' },
    { fecha: '2026-01-15', label: 'b' },
    { fecha: '2026-01-31', label: 'c' },
    { fecha: 'invalid', label: 'd' },
  ];

  it('returns all rows unchanged when desde and hasta are both omitted', () => {
    expect(filterRecordsByDateRange(rows).map((r) => r.label)).toEqual([
      'a',
      'b',
      'c',
      'd',
    ]);
  });

  it('applies only a lower bound when only desde is given', () => {
    expect(
      filterRecordsByDateRange(rows, '2026-01-15').map((r) => r.label)
    ).toEqual(['b', 'c']);
  });

  it('applies only an upper bound when only hasta is given', () => {
    expect(
      filterRecordsByDateRange(rows, undefined, '2026-01-15').map(
        (r) => r.label
      )
    ).toEqual(['a', 'b']);
  });

  it('applies an inclusive range when both bounds are given', () => {
    expect(
      filterRecordsByDateRange(rows, '2026-01-01', '2026-01-15').map(
        (r) => r.label
      )
    ).toEqual(['a', 'b']);
  });

  it('excludes rows with an unparseable fecha once a range is active', () => {
    const result = filterRecordsByDateRange(rows, '2026-01-01', '2026-01-31');
    expect(result.some((r) => r.label === 'd')).toBe(false);
  });

  it('does not mutate the original array', () => {
    filterRecordsByDateRange(rows, '2026-01-01', '2026-01-15');
    expect(rows).toHaveLength(4);
  });
});

describe('computeServicioAverages', () => {
  const servicioValues = ['dominical', 'oracion', 'jovenes'];

  it('rounds the average total per servicio', () => {
    const rows = [
      { servicio: 'dominical', total: 10 },
      { servicio: 'dominical', total: 11 },
    ];
    const result = computeServicioAverages(rows, servicioValues);
    const dominical = result.find((r) => r.servicio === 'dominical');
    expect(dominical).toEqual({
      servicio: 'dominical',
      recordCount: 2,
      averageTotal: 11, // round(21 / 2) = 11 (round-half-up)
    });
  });

  it('renders 0, never NaN, for a servicio with zero records', () => {
    const rows = [{ servicio: 'dominical', total: 10 }];
    const result = computeServicioAverages(rows, servicioValues);
    const oracion = result.find((r) => r.servicio === 'oracion');
    expect(oracion).toEqual({
      servicio: 'oracion',
      recordCount: 0,
      averageTotal: 0,
    });
  });

  it('preserves the supplied servicio order', () => {
    const result = computeServicioAverages([], servicioValues);
    expect(result.map((r) => r.servicio)).toEqual(servicioValues);
  });

  it('appends unknown servicios found in the rows, sorted by localeCompare', () => {
    const rows = [
      { servicio: 'zeta-especial', total: 5 },
      { servicio: 'alabanza-especial', total: 5 },
    ];
    const result = computeServicioAverages(rows, servicioValues);
    expect(result.slice(servicioValues.length).map((r) => r.servicio)).toEqual([
      'alabanza-especial',
      'zeta-especial',
    ]);
  });

  it('returns 0-average rows for every known servicio when given no records', () => {
    const result = computeServicioAverages([], servicioValues);
    expect(
      result.every((r) => r.averageTotal === 0 && r.recordCount === 0)
    ).toBe(true);
  });
});

describe('buildAmigosSeguimiento', () => {
  const amigos = [
    { id: 'a1', nombre: 'Ana' },
    { id: 'a2', nombre: 'Beto' },
  ];

  it('reports the latest fecha/servicio and days-since for an amigo with visits', () => {
    const rows: Array<
      Pick<HistorialRecordRaw, 'fecha' | 'servicio' | 'amigosAsistieron'>
    > = [
      {
        fecha: '2026-01-01',
        servicio: 'dominical',
        amigosAsistieron: [{ id: 'a1', nombre: 'Ana' }],
      },
      {
        fecha: '2026-01-10',
        servicio: 'jovenes',
        amigosAsistieron: [{ id: 'a1', nombre: 'Ana' }],
      },
    ];

    const result = buildAmigosSeguimiento(amigos, rows, '2026-01-20');
    const ana = result.find((r) => r.amigoId === 'a1');
    expect(ana?.ultimaVisita).toEqual({
      fecha: '2026-01-10',
      servicio: 'jovenes',
    });
    expect(ana?.diasSinVisitar).toBe(10);
  });

  it('shows nunca (null) for an amigo with zero appearances', () => {
    const result = buildAmigosSeguimiento(amigos, [], '2026-01-20');
    const beto = result.find((r) => r.amigoId === 'a2');
    expect(beto?.ultimaVisita).toBeNull();
    expect(beto?.diasSinVisitar).toBeNull();
  });

  it('breaks a same-fecha tie by the lowest localeCompare servicio', () => {
    const rows: Array<
      Pick<HistorialRecordRaw, 'fecha' | 'servicio' | 'amigosAsistieron'>
    > = [
      {
        fecha: '2026-01-05',
        servicio: 'jovenes',
        amigosAsistieron: [{ id: 'a1', nombre: 'Ana' }],
      },
      {
        fecha: '2026-01-05',
        servicio: 'dominical',
        amigosAsistieron: [{ id: 'a1', nombre: 'Ana' }],
      },
    ];

    const result = buildAmigosSeguimiento(amigos, rows, '2026-01-05');
    const ana = result.find((r) => r.amigoId === 'a1');
    expect(ana?.ultimaVisita?.servicio).toBe('dominical');
  });

  it('sorts stalest-first with nunca entries last, ties broken by nombre', () => {
    const rows: Array<
      Pick<HistorialRecordRaw, 'fecha' | 'servicio' | 'amigosAsistieron'>
    > = [
      {
        fecha: '2026-01-15',
        servicio: 'dominical',
        amigosAsistieron: [{ id: 'a1', nombre: 'Ana' }],
      },
    ];

    const result = buildAmigosSeguimiento(amigos, rows, '2026-01-20');
    expect(result.map((r) => r.amigoId)).toEqual(['a1', 'a2']);
  });

  it('ignores a future-dated record when computing the last visit', () => {
    const rows: Array<
      Pick<HistorialRecordRaw, 'fecha' | 'servicio' | 'amigosAsistieron'>
    > = [
      {
        fecha: '2026-02-01',
        servicio: 'dominical',
        amigosAsistieron: [{ id: 'a1', nombre: 'Ana' }],
      },
    ];

    const result = buildAmigosSeguimiento(amigos, rows, '2026-01-20');
    const ana = result.find((r) => r.amigoId === 'a1');
    expect(ana?.ultimaVisita).toBeNull();
  });

  it('returns an empty array when given no amigos', () => {
    expect(buildAmigosSeguimiento([], [], '2026-01-20')).toEqual([]);
  });
});

describe('collectMiembroAttendeeIds', () => {
  it('collects ids from every miembrosAsistieron bucket plus hermanosVisitas', () => {
    const ids = collectMiembroAttendeeIds({
      miembrosAsistieron: {
        hermanos: [{ id: 'm1', nombre: 'Uno' }],
        hermanas: [{ id: 'm2', nombre: 'Dos' }],
      },
      hermanosVisitasAsistieron: [{ id: 'h1', nombre: 'Visita' }],
    });

    expect(ids).toEqual(new Set(['m1', 'm2', 'h1']));
  });

  it('returns an empty set when no attendee data is present', () => {
    const ids = collectMiembroAttendeeIds({});
    expect(ids.size).toBe(0);
  });
});

describe('computeTopFaltantes', () => {
  const miembros: MiembroLike[] = [
    { id: 'm1', nombre: 'Ana', categoria: 'hermana', esMiembro: true },
    { id: 'm2', nombre: 'Beto', categoria: 'hermano', esMiembro: true },
    { id: 'm3', nombre: 'Carlos', categoria: 'hermano', esMiembro: false },
  ];

  const today = '2026-04-01'; // epoch day fixed for boundary tests

  function recordOnDaysAgo(
    daysAgo: number,
    attendeeIds: string[]
  ): Pick<
    HistorialRecordRaw,
    'fecha' | 'miembrosAsistieron' | 'hermanosVisitasAsistieron'
  > {
    const todayEpoch = toEpochDay(today)!;
    const epoch = todayEpoch - daysAgo;
    const ms = epoch * 24 * 60 * 60 * 1000;
    const date = new Date(ms);
    const fecha = `${date.getUTCFullYear()}-${String(
      date.getUTCMonth() + 1
    ).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
    return {
      fecha,
      miembrosAsistieron: {
        hermanos: attendeeIds.map((id) => ({ id, nombre: id })),
      },
    };
  }

  it('excludes non-members (esMiembro false or absent)', () => {
    const rows = [recordOnDaysAgo(1, [])];
    const result = computeTopFaltantes(miembros, rows, today);
    expect(result.rows.some((r) => r.miembroId === 'm3')).toBe(false);
  });

  it('counts a record exactly 90 days ago as inside the window', () => {
    const rows = [recordOnDaysAgo(89, [])]; // inclusive window [today-89, today]
    const result = computeTopFaltantes(miembros, rows, today, 90);
    expect(result.servicesInWindow).toBe(1);
  });

  it('excludes a record 91 days ago from the window', () => {
    const rows = [recordOnDaysAgo(90, [])];
    const result = computeTopFaltantes(miembros, rows, today, 90);
    expect(result.servicesInWindow).toBe(0);
  });

  it('omits rows with missedCount === 0', () => {
    const rows = [recordOnDaysAgo(1, ['m1', 'm2'])];
    const result = computeTopFaltantes(miembros, rows, today);
    expect(result.rows).toEqual([]);
  });

  it('sorts by missedCount DESC, ties broken by nombre', () => {
    const rows = [
      recordOnDaysAgo(1, ['m1']), // m1 attended, m2 missed
      recordOnDaysAgo(2, []), // both missed
    ];
    const result = computeTopFaltantes(miembros, rows, today);
    expect(result.rows.map((r) => r.miembroId)).toEqual(['m2', 'm1']);
  });

  it('returns no rows when servicesInWindow is 0 (empty state)', () => {
    const result = computeTopFaltantes(miembros, [], today);
    expect(result.servicesInWindow).toBe(0);
    expect(result.rows).toEqual([]);
  });

  it('does not contribute a record outside the window even though it exists', () => {
    const rows = [recordOnDaysAgo(200, [])];
    const result = computeTopFaltantes(miembros, rows, today);
    expect(result.servicesInWindow).toBe(0);
    expect(result.rows).toEqual([]);
  });
});
