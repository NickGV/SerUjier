# Exploration: Estadísticas de Historial (mejora de estadísticas de asistencia)

> Phase: sdd-explore | Change: historial-stats | Date: 2026-08-24

## Current State

**Data model (`historial` collection, canonical shape in `src/shared/firebase/historial.ts`)**

```ts
interface HistorialRecord {
  id: string; fecha: string; servicio: string; ujier: string | string[];
  hermanos: number; hermanas: number; ninos: number; adolescentes: number;
  amigos: number; heRestauracion?: number; hermanosVisitas?: number; total: number;
  amigosAsistieron?: MiembroSimplificado[];          // { id, nombre } only
  miembrosAsistieron?: MiembrosAsistieron;           // buckets: hermanos/hermanas/ninos/adolescentes/heRestauracion, each { id, nombre }[]
  hermanosVisitasAsistieron?: { id, nombre, iglesia? }[];
}
```

- `servicio` is created from a fixed 9-value enum (`src/features/asistencia/constants/index.ts`: `dominical, oracion, dorcas, evangelismo, misionero, jovenes, intercesion, obra-social, alabanza`), auto-suggested by day-of-week via `getServicioPorFecha` (`src/features/asistencia/lib/servicio-por-fecha.ts`: martes→intercesion, jueves→oracion, sábado→jovenes, domingo→evangelismo, resto→dominical). The historial list page treats it as free text for filtering (`Array.from(new Set(...))`), but it is not free text at creation.
- Records are created/updated through `saveConteo` / `updateHistorialRecord` from `src/features/asistencia/hooks/use-conteo-save.ts`, which calls `@/shared/firebase` (the canonical module) — the write path is clean.
- No `esMiembro` and no per-attendee `categoria` snapshot is stored on historial documents. Attendee entries are only `{id, nombre}`. Bucket key (hermanos/hermanas/ninos/adolescentes) already encodes categoria at the time of the service, but membership (`esMiembro`) is not captured at all — it can only be read by joining attendee IDs against a CURRENT fetch of `miembros`.

**Duplication risk (verified, same class as the `member-tag` finding for `miembros`)**: `fetchHistorial` / `getHistorialRecordById` / `deleteHistorialRecord` exist in TWO places:
- `src/shared/firebase/historial.ts` — canonical, `amigos`-based, matches `HistorialRecord`.
- `src/shared/lib/utils.ts` (lines 247–390) — legacy duplicate, still typed with `simpatizantes` (no `amigos`), no `esMiembro`-era shape.

Both `src/app/(dashboard)/historial/page.tsx` and `.../historial/[id]/page.tsx` import the legacy `shared/lib/utils.ts` functions, then manually normalize in-component (`record.amigos ?? record.simpatizantes ?? 0`, `amigosAsistieron ?? simpatizantesAsistieron ?? visitasAsistieron ?? []`). Any new stats helper must consume this already-normalized `HistorialRecord[]` shape the pages build, not assume the canonical module's shape directly.

**Stats shown TODAY**

- `historial/page.tsx` (list): a single gradient "Statistics Summary" card with 4 numbers over the currently filtered records — Promedio (avg `total`), Registros (count), Máximo, Mínimo (excludes zero-total records). Per-categoria totals (`totalHermanos`, …, `granTotal`) are computed inline but are only written into the Excel/PDF export, never rendered as UI cards.
- `historial/[id]/page.tsx` (detail): a 7-cell category grid (hermanos/hermanas/ninos/adolescentes/amigos/heRestauracion/hermanosVisitas) plus 3 "quick stat" cards — Asistentes (this service's attendee count), Faltantes (diff against ALL current `miembros`, fetched via `fetchMiembros()`), and a card labeled "Total Asistentes" that actually renders `allMembers.length` (total registered miembros) — a pre-existing labeling bug, unrelated to this change but flagged to the owner.

**No chart library is installed.** `package.json` has no `recharts`, `chart.js`, `victory`, `nivo`, etc. All existing visuals are Tailwind CSS grid cells / badges — no SVG/canvas charts anywhere in the app today.

**Orphaned prior refactor attempt**: `src/features/historial/components/historial/{StatsSummary.tsx, CategoryGrid.tsx, utils.ts}` implement an equivalent (arguably cleaner, `CATEGORIES`-config-driven) extraction of the exact same stats/category logic as the live page — but nothing imports them (verified via repo-wide grep). Any new stats work must explicitly decide whether to delete, revive, or ignore this dead code rather than adding a third parallel implementation.

**Testing precedent to mirror**: `src/shared/lib/miembros-filters.ts` + `src/__tests__/lib/miembros-filters.test.ts`, and `src/shared/lib/sort-utils.ts` + `src/__tests__/lib/sort-utils.test.ts` — both are small, pure, framework-free helper modules with a 1:1 test mirror under `src/__tests__/lib/`. A new `historial-stats.ts` (or similar) helper should follow this exact pattern.

## Affected

- `src/app/(dashboard)/historial/page.tsx` — current list-level stats live inline here (1164 lines); target for new/extended stats surface or the entry point to a new stats tab/section.
- `src/app/(dashboard)/historial/[id]/page.tsx` — per-record detail stats live inline here; also already fetches `fetchMiembros()`, the pattern to mirror for any list-level member-vs-non-member cut.
- `src/shared/firebase/historial.ts` — canonical `HistorialRecord` type + CRUD (write path already correct).
- `src/shared/lib/utils.ts` — legacy duplicate historial CRUD (`simpatizantes` naming) that both historial pages currently read through.
- `src/shared/firebase/miembros.ts` — `fetchMiembros()` / `Miembro.esMiembro`; needed for member-vs-non-member and "top faltantes" aggregates.
- `src/features/asistencia/constants/index.ts` — `servicios` (9-value enum), `CATEGORIA_LABELS`/`CATEGORIA_COLORS` — reusable for consistent stat labeling.
- `src/features/asistencia/lib/servicio-por-fecha.ts` — day-of-week → servicio mapping, relevant context for servicio-type stats.
- `src/features/historial/components/historial/{StatsSummary.tsx, CategoryGrid.tsx, utils.ts}` — orphaned duplicate stats logic; must be explicitly addressed.
- `src/shared/lib/miembros-filters.ts`, `src/shared/lib/sort-utils.ts` (+ their `src/__tests__/lib/*.test.ts` mirrors) — pattern precedent for a new pure aggregation helper.
- `package.json` — no chart library present; adding one (e.g. `recharts`) is a new dependency decision, not a given.

## Approaches

1. **Client-side aggregation of already-fetched records, plain stat cards (no new deps)** — pure functions over the `HistorialRecord[]` already fetched (trend by week/month, average per servicio, per-categoria trend, best/worst service); +1 optional `fetchMiembros()` read (mirroring `[id]/page.tsx`) unlocks member-vs-non-member and "top faltantes."
   - Pros: zero new dependencies/bundle cost; matches existing visual language; fully unit-testable pure helpers (mirrors `miembros-filters.ts`/`sort-utils.ts`); no new Firestore read cost beyond one extra query for member/faltantes cuts.
   - Cons: no true trend-line visuals, just numbers or crude bars; harder to spot multi-week patterns at a glance.
   - Effort: Low

2. **Add a chart library (recharts vs chart.js vs CSS-only bars)**
   - `recharts`: React-idiomatic SVG, composes with Tailwind; shadcn/ui's official "chart" block is built on recharts, so it's the closest fit to the installed design system.
   - `chart.js` via `react-chartjs-2`: canvas-based, more imperative wrapper glue, not smaller than recharts once wrapped, less idiomatic with the RSC/client-component split already in use.
   - CSS-only sparklines/bars: zero bundle cost, but no tooltips/legends/responsive scaling without hand-rolling, and a low usefulness ceiling once real trend comparisons are wanted.
   - Any chart choice should be lazy-loaded (`next/dynamic(..., { ssr: false })`) and scoped only to the stats view, per the react/Next bundle-size rules — never bundled into the initial historial list load.
   - Pros: real trend/comparison visuals, better product signal.
   - Cons: new dependency, bundle-size discipline required, more design/review surface.
   - Effort: Low (CSS bars) to Medium (recharts + shadcn chart wrapper) to Medium-High (chart.js)

3. **Separate "Estadísticas" tab/section vs enriching the existing historial page**
   - Separate tab/section: keeps the already-1164-line `historial/page.tsx` from growing further; gives a natural code-splitting boundary for any chart bundle (only loads when visited); clearer IA ("browse records" vs "see the numbers").
   - Enrich in place: fewer clicks, stats sit next to the filters that already scope them (fecha/servicio/día); but grows an already-large client component with many `useState` hooks.
   - Effort: new tab/section: Medium (new route/section wiring); enrich in place: Low-Medium (same file, rising complexity)

## Recommendation

Ship in two slices: (1) a dependency-free slice — pure aggregation helpers (new `src/shared/lib/historial-stats.ts`, unit-tested like `miembros-filters.ts`) covering trend-by-week/month, per-servicio averages, per-categoria breakdown over time, best/worst service, plus the one extra `fetchMiembros()` read for member-vs-non-member and "top faltantes" — surfaced as plain stat cards / CSS bars in a new "Estadísticas" section so the already-monolithic list page isn't grown further; (2) an optional follow-up slice adding `recharts` (via shadcn's chart primitives, lazy-loaded) only if the owner confirms numbers/bars aren't enough after seeing slice 1. This sequencing avoids a bundle-size commitment before validating which stats the owner actually finds useful, and keeps the change decoupled from the pre-existing `shared/lib/utils.ts` vs `shared/firebase/historial.ts` duplication and the orphaned `features/historial/components/historial/*` files rather than entangling this change with fixing them.

## Risks

- Any stats helper consuming historial data must match the pages' in-component normalization (post-`simpatizantes`/`amigos` fallback), not the canonical module's raw shape, or it will miscount pre-unification legacy records.
- The orphaned `features/historial/components/historial/{StatsSummary,CategoryGrid,utils}` files implement near-identical logic; leaving them unaddressed risks a future duplicate (fourth) implementation of the same stats.
- Member-vs-non-member and "top faltantes" aggregates reflect CURRENT `esMiembro` status, not a point-in-time snapshot — consistent with how `[id]/page.tsx` already computes faltantes today, but the owner should explicitly confirm this is acceptable for historical charts.
- Adding `fetchMiembros()` to the list page adds one additional Firestore query per page load (not per record) — small, bounded, but worth confirming against any Firestore cost sensitivity.
- If a chart library is added without lazy-loading/code-splitting discipline, it will penalize the historial list page's bundle for every visitor, including those who never open the stats view.
- Pre-existing, adjacent bug found during this exploration (not in scope, but surfaced): `[id]/page.tsx`'s third quick-stat card is labeled "Total Asistentes" but renders `allMembers.length` (total registered miembros), not this service's attendee count.

## Ready for Proposal

Yes — the technical groundwork (data model, current stats, dependencies, testing precedent, duplication/dead-code traps) is fully mapped. sdd-propose should resolve the open product questions below with the owner before locking scope, since the original request was intentionally open-ended.

## Open Product Questions for the Proposal Round

1. Which stats matter most to ship first: overall attendance trend over time (week/month), per-servicio-type averages, per-categoria trend, member-vs-non-member attendance, or "top faltantes" (most-missed members)? Pick 1–3 for slice 1.
2. Should stats live in a new "Estadísticas" tab/section, or stay enriching the current historial list page?
3. Are real charts (recharts line/bar) wanted for v1, or are number cards / simple CSS bars sufficient to start?
4. Is a member-vs-non-member cut acceptable as a CURRENT-`esMiembro`-status computation (not a historical snapshot), matching how faltantes already work today?
5. Should "top faltantes" be scoped to a recent window (e.g., last 90 days) to stay actionable, or computed all-time?
6. Should the dead `features/historial/components/historial/*` files be deleted, revived, or explicitly left untouched as part of this change?
