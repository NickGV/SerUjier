/**
 * Pure, framework-free aggregation helpers for the historial "Estadísticas" view.
 *
 * This module MUST stay free of value-imports from `@/shared/firebase/*` or
 * `@/shared/lib/firebase`: those modules initialize the Firebase browser SDK at
 * module load time and throw without `NEXT_PUBLIC_*` env vars, which would break
 * these functions under jest. Only type-only imports from `@/shared/types` are
 * used here.
 */

import type { Miembro, MiembroSimplificado } from '@/shared/types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Closed set of categoria keys a `miembro` attendee can be bucketed under.
 * Mirrors the pre-Slice-A literal union both historial pages declared
 * inline, so a misspelled key fails `pnpm type-check` instead of silently
 * type-checking and yielding `undefined` at runtime.
 */
export type MiembroAsistioCategoria =
  | 'hermanos'
  | 'hermanas'
  | 'ninos'
  | 'adolescentes'
  | 'heRestauracion';

/** Attendee ids grouped by a known categoria bucket key. */
export type AttendeeBuckets = Partial<
  Record<MiembroAsistioCategoria, MiembroSimplificado[]>
>;

/** Subset of `Miembro` needed to rank top faltantes. */
export type MiembroLike = Pick<
  Miembro,
  'id' | 'nombre' | 'categoria' | 'esMiembro'
>;

/**
 * Structural shape of a historial record as read from Firestore, including
 * every legacy field this feature must still understand. Each page keeps its
 * own local record type; as long as it satisfies this shape, it can be passed
 * to `normalizeHistorialRecord`.
 */
export interface HistorialRecordRaw {
  fecha: string;
  servicio: string;
  total: number;
  amigos?: number;
  simpatizantes?: number; // legacy
  heRestauracion?: number;
  hermanosVisitas?: number;
  amigosAsistieron?: MiembroSimplificado[];
  simpatizantesAsistieron?: MiembroSimplificado[]; // legacy
  visitasAsistieron?: MiembroSimplificado[]; // legacy
  miembrosAsistieron?: AttendeeBuckets;
  hermanosVisitasAsistieron?: Array<{ id: string; nombre: string }>;
}

/** Fields `normalizeHistorialRecord` guarantees are present and defaulted. */
export interface NormalizedHistorialFields {
  amigos: number;
  heRestauracion: number;
  hermanosVisitas: number;
  amigosAsistieron: MiembroSimplificado[];
}

/**
 * Resolves the legacy `simpatizantes` -> `amigos` fallback chain (and its
 * matching attendee-list fallback) so both `historial/page.tsx` and
 * `historial/[id]/page.tsx` share a single normalization implementation.
 * Behavior mirrors the inline `??` chains previously duplicated in each page.
 */
export function normalizeHistorialRecord<T extends HistorialRecordRaw>(
  record: T
): T & NormalizedHistorialFields {
  return {
    ...record,
    amigos: record.amigos ?? record.simpatizantes ?? 0,
    amigosAsistieron:
      record.amigosAsistieron ??
      record.simpatizantesAsistieron ??
      record.visitasAsistieron ??
      [],
    heRestauracion: record.heRestauracion || 0,
    hermanosVisitas: record.hermanosVisitas || 0,
  };
}

/**
 * Today's date as a local `YYYY-MM-DD` string. Deliberately uses local
 * getters (never `toISOString().split('T')[0]`), which shifts to the
 * following UTC day in the evening for any timezone behind UTC.
 */
export function todayISODate(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converts a `YYYY-MM-DD` string to a UTC epoch-day number (days since the
 * Unix epoch), which is DST/timezone-proof for date-math comparisons.
 * Returns `null` for anything unparseable, including invalid calendar dates
 * (e.g. `2024-02-30`).
 */
export function toEpochDay(fecha: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utcMs = Date.UTC(year, month - 1, day);
  const roundTrip = new Date(utcMs);

  const isValidCalendarDate =
    roundTrip.getUTCFullYear() === year &&
    roundTrip.getUTCMonth() === month - 1 &&
    roundTrip.getUTCDate() === day;

  if (!isValidCalendarDate) return null;

  return Math.floor(utcMs / MS_PER_DAY);
}

/**
 * Filters rows to an inclusive `[desde, hasta]` date range. A bound counts
 * as "active" only when it parses to a real calendar date via `toEpochDay`;
 * an omitted, empty, or *unparseable* bound (e.g. `'2026-13-01'`) is treated
 * exactly like an absent one for that side — it never narrows the range and
 * it never, by itself, flips the range from "inactive" to "active". This
 * matters because an active range excludes rows whose own `fecha` is
 * unparseable, so without this rule a malformed bound could silently start
 * dropping rows it was never meant to affect. Only when at least one bound
 * resolves to a real date does the range become active.
 */
export function filterRecordsByDateRange<T extends { fecha: string }>(
  rows: readonly T[],
  desde?: string,
  hasta?: string
): T[] {
  const desdeEpoch = desde ? toEpochDay(desde) : null;
  const hastaEpoch = hasta ? toEpochDay(hasta) : null;

  if (desdeEpoch === null && hastaEpoch === null) return [...rows];

  return rows.filter((row) => {
    const rowEpoch = toEpochDay(row.fecha);
    if (rowEpoch === null) return false;
    if (desdeEpoch !== null && rowEpoch < desdeEpoch) return false;
    if (hastaEpoch !== null && rowEpoch > hastaEpoch) return false;
    return true;
  });
}

export interface ServicioAverageRow {
  servicio: string;
  recordCount: number;
  averageTotal: number;
}

/**
 * Computes the average `total` and record count per servicio. The supplied
 * `servicioValues` order is preserved (even for zero-record entries, which
 * render `0`, never `NaN`); any servicio found in `rows` but absent from
 * `servicioValues` is appended afterward, sorted by `localeCompare`.
 */
export function computeServicioAverages(
  rows: readonly Pick<HistorialRecordRaw, 'servicio' | 'total'>[],
  servicioValues: readonly string[]
): ServicioAverageRow[] {
  const knownOrder = [...servicioValues];
  const extraServicios = Array.from(
    new Set(
      rows
        .map((row) => row.servicio)
        .filter((servicio) => !knownOrder.includes(servicio))
    )
  ).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

  const allServicios = [...knownOrder, ...extraServicios];

  return allServicios.map((servicio) => {
    const matching = rows.filter((row) => row.servicio === servicio);
    const recordCount = matching.length;
    const averageTotal =
      recordCount === 0
        ? 0
        : Math.round(
            matching.reduce((sum, row) => sum + row.total, 0) / recordCount
          );
    return { servicio, recordCount, averageTotal };
  });
}

export interface AmigoSeguimientoRow {
  amigoId: string;
  nombre: string;
  ultimaVisita: { fecha: string; servicio: string } | null;
  diasSinVisitar: number | null;
}

/**
 * Builds the all-time amigos follow-up table: every amigo appears exactly
 * once, carrying their latest attended fecha/servicio and days-since. Amigos
 * with no recorded visit get `ultimaVisita: null` / `diasSinVisitar: null`
 * (rendered as "nunca") and sort last. Rows are sorted stalest-first (days
 * DESC), ties broken by `nombre`. Unparseable or future `fecha` values are
 * ignored when computing the latest visit.
 */
export function buildAmigosSeguimiento(
  amigos: readonly { id: string; nombre: string }[],
  rows: readonly Pick<
    HistorialRecordRaw,
    'fecha' | 'servicio' | 'amigosAsistieron'
  >[],
  todayISO: string
): AmigoSeguimientoRow[] {
  const todayEpoch = toEpochDay(todayISO);

  const lastVisitByAmigoId = new Map<
    string,
    { fecha: string; servicio: string; epoch: number }
  >();

  for (const row of rows) {
    const epoch = toEpochDay(row.fecha);
    if (epoch === null) continue;
    if (todayEpoch !== null && epoch > todayEpoch) continue;

    for (const amigo of row.amigosAsistieron ?? []) {
      const current = lastVisitByAmigoId.get(amigo.id);
      const isNewer = !current || epoch > current.epoch;
      const isSameDayEarlierServicio =
        current !== undefined &&
        epoch === current.epoch &&
        row.servicio.localeCompare(current.servicio, 'es', {
          sensitivity: 'base',
        }) < 0;

      if (isNewer || isSameDayEarlierServicio) {
        lastVisitByAmigoId.set(amigo.id, {
          fecha: row.fecha,
          servicio: row.servicio,
          epoch,
        });
      }
    }
  }

  const seguimiento: AmigoSeguimientoRow[] = amigos.map((amigo) => {
    const lastVisit = lastVisitByAmigoId.get(amigo.id);
    if (!lastVisit) {
      return {
        amigoId: amigo.id,
        nombre: amigo.nombre,
        ultimaVisita: null,
        diasSinVisitar: null,
      };
    }

    const diasSinVisitar =
      todayEpoch === null ? null : Math.max(0, todayEpoch - lastVisit.epoch);

    return {
      amigoId: amigo.id,
      nombre: amigo.nombre,
      ultimaVisita: { fecha: lastVisit.fecha, servicio: lastVisit.servicio },
      diasSinVisitar,
    };
  });

  return [...seguimiento].sort((a, b) => {
    if (a.diasSinVisitar === null && b.diasSinVisitar === null) {
      return a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' });
    }
    if (a.diasSinVisitar === null) return 1;
    if (b.diasSinVisitar === null) return -1;
    if (a.diasSinVisitar !== b.diasSinVisitar) {
      return b.diasSinVisitar - a.diasSinVisitar;
    }
    return a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' });
  });
}

/**
 * Collects every attendee id for a record: all `miembrosAsistieron` buckets
 * plus `hermanosVisitasAsistieron`.
 */
export function collectMiembroAttendeeIds(
  row: Pick<
    HistorialRecordRaw,
    'miembrosAsistieron' | 'hermanosVisitasAsistieron'
  >
): Set<string> {
  const ids = new Set<string>();

  if (row.miembrosAsistieron) {
    for (const bucket of Object.values(row.miembrosAsistieron)) {
      bucket?.forEach((miembro) => ids.add(miembro.id));
    }
  }

  row.hermanosVisitasAsistieron?.forEach((hermano) => ids.add(hermano.id));

  return ids;
}

export interface FaltantesRow {
  miembroId: string;
  nombre: string;
  categoria: string;
  missedCount: number;
  attendedCount: number;
}

export interface FaltantesResult {
  windowStart: number;
  windowEnd: number;
  servicesInWindow: number;
  rows: FaltantesRow[];
}

/**
 * Ranks `esMiembro: true` miembros by services missed within an inclusive
 * `windowDays`-day window ending today (default 90). A miss is any in-window
 * record whose attendee-id set lacks the miembro; rows with `missedCount ===
 * 0` are omitted. When no service falls in the window, `rows` is empty.
 */
export function computeTopFaltantes(
  miembros: readonly MiembroLike[],
  rows: readonly Pick<
    HistorialRecordRaw,
    'fecha' | 'miembrosAsistieron' | 'hermanosVisitasAsistieron'
  >[],
  todayISO: string,
  windowDays = 90
): FaltantesResult {
  const todayEpoch = toEpochDay(todayISO);
  const windowEnd = todayEpoch ?? 0;
  const windowStart = windowEnd - (windowDays - 1);

  const rowsInWindow =
    todayEpoch === null
      ? []
      : rows.filter((row) => {
          const epoch = toEpochDay(row.fecha);
          return epoch !== null && epoch >= windowStart && epoch <= windowEnd;
        });

  const servicesInWindow = rowsInWindow.length;

  if (servicesInWindow === 0) {
    return { windowStart, windowEnd, servicesInWindow, rows: [] };
  }

  const attendeeSets = rowsInWindow.map((row) =>
    collectMiembroAttendeeIds(row)
  );

  const faltantesRows: FaltantesRow[] = miembros
    .filter((miembro) => miembro.esMiembro === true)
    .map((miembro) => {
      let attendedCount = 0;
      let missedCount = 0;
      for (const attendeeIds of attendeeSets) {
        if (attendeeIds.has(miembro.id)) {
          attendedCount += 1;
        } else {
          missedCount += 1;
        }
      }
      return {
        miembroId: miembro.id,
        nombre: miembro.nombre,
        categoria: miembro.categoria,
        missedCount,
        attendedCount,
      };
    })
    .filter((row) => row.missedCount > 0)
    .sort((a, b) => {
      if (a.missedCount !== b.missedCount) {
        return b.missedCount - a.missedCount;
      }
      return a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' });
    });

  return { windowStart, windowEnd, servicesInWindow, rows: faltantesRows };
}
