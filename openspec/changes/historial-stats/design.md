# Design: Estadísticas de Historial

## Technical Approach

`src/app/(dashboard)/historial/estadisticas/page.tsx` re-exports
`@/features/historial/pages/HistorialEstadisticasPage` (the existing `amigos/page.tsx` pattern).
That page is `'use client'` under `RoleGuard requiredPermission="historial.view"` (list-page parity);
one `useEffect` runs `Promise.all([fetchHistorial(), fetchMiembros(), fetchAmigos()])`, maps records
through `normalizeHistorialRecord`, and stores `{ records, miembros, amigos, today }` as one state
object. Statistics are derived during render in separate `useMemo`s and passed to presentational
components. Implements `specs/historial-stats/spec.md`.

## Architecture Decisions

| # | Choice | Rejected | Rationale |
|---|---|---|---|
| D1 | Client component: `useEffect` + `Promise.all` of 3 fetches, mirroring `historial/[id]/page.tsx` | Server Component | `@/shared/lib/firebase` is the browser SDK and *throws at module load* without `NEXT_PUBLIC_*`; access control is client context (`RoleGuard`, `useModulePermissions`). RSC would need a second admin-SDK read boundary. `Promise.all` already satisfies `async-parallel` — no waterfall |
| D2 | Helpers in `src/shared/lib/historial-stats.ts`, importing **only** types from `@/shared/types` | Importing `HistorialRecord` from `@/shared/firebase/historial`; helpers under `features/` | A non-`type` import of that module runs `db` init and breaks jest. Structural inputs keep fixtures tiny and keep `shared/` off `features/` |
| D3 | `computeServicioAverages(rows, servicioValues)` receives the 9 enum values; labels stay in the view | Helper imports `servicios` from `@/features/asistencia/constants` | Same layering rule; injection makes the zero-record servicio case trivially testable |
| D4 | `today` is a `'YYYY-MM-DD'` parameter; date math via epoch-day from `Date.UTC(y, m-1, d)` | `new Date()` inside helpers; `toISOString().split('T')[0]` | Injected `today` keeps days-since tests stable; epoch-day is DST/timezone-proof, while `toISOString` shifts the date after 19:00 in UTC-5 (live bug at `historial/page.tsx:309`) |
| D5 | `src/shared/ui/chart.tsx` (shadcn) + `ServicioAveragesChart.tsx` (sole recharts importer), pulled in via `next/dynamic(..., { ssr: false })` with a `Skeleton` fallback | Raw recharts, no primitive (~300 fewer lines, loses shared tooltip/theming); static import | `--chart-1..5` already exist in `globals.css`, so the primitive adds no CSS; `src/shared/ui` has no barrel, so recharts cannot leak into the list chunk. **Those vars hold HSL triplets → `chartConfig` colors must be `hsl(var(--chart-1))`** |
| D6 | Amigos view: semantic `<table>` in a `Card` + `overflow-x-auto` | `shadcn add table` (~120 vendored lines for one 3-column use); card-row list (fails the spec's literal "exactly one table") | Literal compliance, mobile-safe, zero primitive cost; swapping the primitive in later is mechanical |
| D7 | `desde`/`hasta` `useState('')` in the page (list-page naming), empty = all records; range applied inside the **averages** memo only | Shared/global filter; URL `searchParams` | Separate memos guarantee the range never touches the amigos or faltantes views, which the spec forbids scoping; `useSearchParams` would force a CSR-bailout Suspense boundary for no gain |
| D8 | Unit-test every helper export; views verified by `npm run build` + manual; bundle isolation by chunk inspection | RTL tests of chart/table; Firestore mocks | Matches `miembros-filters` / `firebase/miembros.test.ts` precedent; recharts in jsdom needs `ResponsiveContainer` stubs and asserts nothing the pure tests do not |

## Interfaces / Contracts

```ts
// src/shared/lib/historial-stats.ts
import type { Miembro, MiembroSimplificado } from '@/shared/types';

export type AttendeeBuckets = Partial<Record<string, MiembroSimplificado[]>>;
export type MiembroLike = Pick<Miembro, 'id' | 'nombre' | 'categoria' | 'esMiembro'>;

export interface HistorialRecordRaw {
  fecha: string; servicio: string; total: number;
  amigos?: number; simpatizantes?: number;              // legacy
  heRestauracion?: number; hermanosVisitas?: number;
  amigosAsistieron?: MiembroSimplificado[];
  simpatizantesAsistieron?: MiembroSimplificado[];      // legacy
  visitasAsistieron?: MiembroSimplificado[];            // legacy
  miembrosAsistieron?: AttendeeBuckets;
  hermanosVisitasAsistieron?: Array<{ id: string; nombre: string }>;
}
export interface NormalizedHistorialFields {
  amigos: number; heRestauracion: number; hermanosVisitas: number;
  amigosAsistieron: MiembroSimplificado[];
}

// generic intersection so each page keeps its own local record type
export function normalizeHistorialRecord<T extends HistorialRecordRaw>(
  record: T): T & NormalizedHistorialFields;

export function todayISODate(now?: Date): string;          // local Y/M/D, never toISOString
export function toEpochDay(fecha: string): number | null;
export function filterRecordsByDateRange<T extends { fecha: string }>(
  rows: readonly T[], desde?: string, hasta?: string): T[];

// ServicioAverageRow = { servicio, recordCount, averageTotal }
export function computeServicioAverages(
  rows: readonly Pick<HistorialRecordRaw, 'servicio' | 'total'>[],
  servicioValues: readonly string[]): ServicioAverageRow[];

// AmigoSeguimientoRow = { amigoId, nombre, ultimaVisita: { fecha, servicio } | null, diasSinVisitar: number | null }
export function buildAmigosSeguimiento(
  amigos: readonly { id: string; nombre: string }[],
  rows: readonly Pick<HistorialRecordRaw, 'fecha' | 'servicio' | 'amigosAsistieron'>[],
  todayISO: string): AmigoSeguimientoRow[];

export function collectMiembroAttendeeIds(                  // all buckets + hermanosVisitas
  row: Pick<HistorialRecordRaw, 'miembrosAsistieron' | 'hermanosVisitasAsistieron'>): Set<string>;

// FaltantesResult = { windowStart, windowEnd, servicesInWindow, rows: { miembroId, nombre, categoria, missedCount, attendedCount }[] }
export function computeTopFaltantes(
  miembros: readonly MiembroLike[],
  rows: readonly Pick<HistorialRecordRaw, 'fecha' | 'miembrosAsistieron' | 'hermanosVisitasAsistieron'>[],
  todayISO: string, windowDays?: number /* 90 */): FaltantesResult;
```

**Deterministic rules (each unit-tested):**

- Window = inclusive epoch-day range `[today - (windowDays - 1), today]`; unparseable or future `fecha` excluded everywhere.
- `diasSinVisitar = max(0, todayEpoch - fechaEpoch)`; `null` renders `nunca`.
- Same-`fecha` tie for an amigo → the `servicio` with the lowest `localeCompare`.
- Seguimiento sort: days DESC, `nunca` last, ties by `nombre.localeCompare(b, 'es', { sensitivity: 'base' })` (list-page precedent).
- Faltantes: `esMiembro === true` only; a miss = any in-window record whose attendee-id set lacks the miembro; `missedCount === 0` rows omitted; sort `missedCount` DESC then `nombre`; `servicesInWindow === 0` → no rows (empty state).
- Averages: `Math.round(sum / count)`, `count === 0 → 0` (never `NaN`); supplied servicio order preserved, unknown servicios found in records appended by `localeCompare`.
- Sorts run on fresh arrays via `[...rows].sort(...)`, not `toSorted` (Node-version safe).

## Data Flow

    fetchHistorial ─┐
    fetchMiembros  ─┼→ Promise.all → normalizeHistorialRecord → state { records, miembros, amigos, today }
    fetchAmigos    ─┘                                            │
                        ├→ memo buildAmigosSeguimiento ─────────→ AmigosSeguimientoTable
    desde/hasta ──→ filterRecordsByDateRange → memo computeServicioAverages → ServicioAveragesCard
                                                                 │      └→ dynamic(ssr:false) Chart → recharts
                        └→ memo computeTopFaltantes (fixed 90d) → TopFaltantesCard

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/shared/lib/historial-stats.ts` | Create | Pure helpers + normalizer (contract above) |
| `src/__tests__/lib/historial-stats.test.ts` | Create | 1:1 unit tests |
| `src/app/(dashboard)/historial/estadisticas/page.tsx` | Create | Route segment, one-line re-export |
| `src/features/historial/pages/HistorialEstadisticasPage.tsx` | Create | Client shell: guard, fetch, state, memos, dynamic chart |
| `.../components/estadisticas/AmigosSeguimientoTable.tsx` | Create | Single table, stalest-first, `nunca` last |
| `.../components/estadisticas/ServicioAveragesCard.tsx` | Create | Date-range inputs + averages, hosts the chart |
| `.../components/estadisticas/ServicioAveragesChart.tsx` | Create | Bar chart; only module importing recharts |
| `.../components/estadisticas/TopFaltantesCard.tsx` | Create | 90-day ranking, `missedCount / servicesInWindow` |
| `src/shared/ui/chart.tsx`, `src/shared/ui/skeleton.tsx` | Create | `npx shadcn@latest add chart skeleton` |
| `src/app/(dashboard)/historial/page.tsx` | Modify | Header entry link (`Link` + `BarChart3`); both inline `??` chains → `normalizeHistorialRecord` |
| `src/app/(dashboard)/historial/[id]/page.tsx` | Modify | Adopt normalizer; "Total Asistentes" → `asistentes.length` (was `allMembers.length`) |
| `src/features/historial/components/historial/{StatsSummary,CategoryGrid,utils}` | Delete | Orphaned duplicate stats logic (410 lines) |
| `package.json` + lockfile | Modify | `recharts` |

## Testing Strategy

| Layer | What | How |
|-------|------|-----|
| Unit | Every export: legacy + current normalization, empty input, zero-record servicio, `nunca` amigo, tie-breaks, window boundary (day 90 in / 91 out), invalid & future `fecha`, `esMiembro` filter | jest, plain fixtures, injected `today`, no Firestore mocks |
| Integration | Route renders; filter scopes averages only | Manual `npm run dev` pass |
| Build | recharts absent from the historial list chunk; no `NaN`; types/lint | `npm run build` chunk inspection + `npm run check` |

## Threat Matrix

N/A — no shell command, subprocess, VCS/PR automation, executable-file classification, or process integration. The only routing change is a static Next.js page segment with no dynamic params, no server-side input handling, and no write path; access stays behind the existing `RoleGuard` gate.

## Migration / Rollout

No migration required — read-only aggregation; no Firestore write, field, or rule change.

**Pre-declared slice boundary** (proposal split; stacked PRs if the tasks-phase forecast exceeds 800 lines, per the `member-tag` precedent):

- **Slice A** (~700 lines): helpers + tests, route segment, page shell, `AmigosSeguimientoTable`, entry link, normalizer adoption in both existing pages.
- **Slice B** (~750 lines): `recharts` + `chart.tsx`/`skeleton.tsx`, averages card + chart, date-range filter, `TopFaltantesCard`, orphan deletion, `[id]` label fix.

## Open Questions

- None blocking. Confirm actual chunk names from `npm run build` output when asserting the list bundle carries no recharts.
