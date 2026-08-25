# Tasks: Estadísticas de Historial

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1450 (adds: ~940, deletes: ~410, vendor: ~100) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | Slice A → Slice B (stacked to main) |
| Delivery strategy | single-pr (decision needed) |
| Chain strategy | stacked-to-main (if approved) |

**Plain-text guard lines:**

```
Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High
```

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|------------------|-------------------|
| Slice A (~700 lines) | Helpers, route, amigos table, normalizer adoption in existing pages | PR 1 | `npm test -- historial-stats` | Manual: navigate to `/historial/estadisticas` and verify amigos table renders | Revert `src/shared/lib/historial-stats.ts`, `src/__tests__/lib/`, `src/app/(dashboard)/historial/estadisticas/`, `src/features/historial/pages/HistorialEstadisticasPage.tsx`, `src/features/historial/components/estadisticas/AmigosSeguimientoTable.tsx`, and changes to both existing historial pages |
| Slice B (~750 lines) | recharts integration, averages + faltantes cards, orphan cleanup, [id] label fix | PR 2 | `npm test && npm run build` | Manual: verify recharts absent from historial list chunk; inspect chart renders with date-range filter | Revert shadcn chart/skeleton, `src/features/historial/components/estadisticas/{ServicioAverages,TopFaltantes}*`, orphan deletions, package.json recharts entry |

---

## Phase 1: Helpers & Testing (Slice A Foundation)

- [x] 1.1 Create `src/shared/lib/historial-stats.ts` with pure functions: `normalizeHistorialRecord`, `todayISODate`, `toEpochDay`, `filterRecordsByDateRange`, `computeServicioAverages`, `buildAmigosSeguimiento`, `collectMiembroAttendeeIds`, `computeTopFaltantes`. Export types: `HistorialRecordRaw`, `NormalizedHistorialFields`, `AttendeeBuckets`, `MiembroLike`, `ServicioAverageRow`, `AmigoSeguimientoRow`, `FaltantesResult`.
- [x] 1.2 Create `src/__tests__/lib/historial-stats.test.ts` covering: legacy normalization (simpatizantes fallback), current amigos, empty input, zero-record servicio (no NaN), `nunca` amigo (never visited), tie-breaks (same-fecha, same-missedCount), window boundary (day 90 in / 91 out), invalid & future fecha, `esMiembro` filter, all-time vs filtered scopes.
- [x] 1.3 Verify test coverage: `npm test -- historial-stats` passes; helpers load without Firebase module side-effects.

## Phase 2: Route & Page Shell (Slice A Core)

- [x] 2.1 Create `src/app/(dashboard)/historial/estadisticas/page.tsx` (one-line re-export of `@/features/historial/pages/HistorialEstadisticasPage`).
- [x] 2.2 Create `src/features/historial/pages/HistorialEstadisticasPage.tsx`: `'use client'` under `RoleGuard requiredPermission="historial.view"`, one `useEffect` running `Promise.all([fetchHistorial(), fetchMiembros(), fetchAmigos()])`, map through `normalizeHistorialRecord`, store `{ records, amigos, today }`. **Partial scope**: only the amigos-seguimiento `useMemo` was built in this slice; the averages (date-filtered) and faltantes (fixed 90d) `useMemo`s are deferred to Slice B per explicit orchestrator scope instruction (Phase 4/5 chart work), even though this task originally described all three. Consequently the `Promise.all` here fetches only `fetchHistorial()` + `fetchAmigos()`: the `fetchMiembros()` read is added by Slice B together with the top-faltantes card that consumes it, so this view issues no query it does not use.
- [x] 2.3 Verify route segment: `npm run build` confirms `/historial/estadisticas` compiles as a static route; page shell renders (loading/error/content states) using existing patterns.

## Phase 3: Amigos Table & Normalizer Adoption (Slice A UI)

- [x] 3.1 Create `src/features/historial/components/estadisticas/AmigosSeguimientoTable.tsx`: semantic `<table>` inside a `Card`, columns = nombre, última visita (fecha + servicio), días sin visitar. Sort stalest-first (days DESC), `nunca` last (days is null). Name & tie-break via `localeCompare('es', { sensitivity: 'base' })`. Responsive with `overflow-x-auto`.
- [x] 3.2 Update `src/app/(dashboard)/historial/page.tsx`: (a) add entry `Link` to `/historial/estadisticas` with `BarChart3` icon; (b) replace inline `??` chains with `normalizeHistorialRecord()` call in the list view.
- [x] 3.3 Update `src/app/(dashboard)/historial/[id]/page.tsx`: (a) adopt `normalizeHistorialRecord()` at fetch (slice A). **(b) done in slice B, then superseded by an owner decision**: the value was first repointed from `allMembers.length` to `asistentes.length` as written. That made the card an exact duplicate of the adjacent "Asistentes" card, so on 2026-08-25 the owner chose to **delete** the "Total Asistentes" card and drop the quick-stat grid from `sm:grid-cols-3` to `sm:grid-cols-2`. Spec requirement 8 and design.md were amended to match; see the decision-history note in `specs/historial-stats/spec.md`.
- [x] 3.4 Verified via code review + automated checks: `buildAmigosSeguimiento` test suite covers stalest-first sort and "nunca" placement; `npm run build` confirms the `/historial/estadisticas` route compiles and the entry link renders in `historial/page.tsx`. (Interactive `npm run dev` click-through was not run; not in the mandated automated verification list for this phase.)

## Phase 4: Chart Primitives (Slice B Foundation)

- [x] 4.1 Ran `pnpm dlx shadcn@latest add chart skeleton` (pnpm, not npx — this repo is pnpm-exclusive) to install `src/shared/ui/chart.tsx` and `src/shared/ui/skeleton.tsx`. The CLI prompted to overwrite the already-customized `card.tsx`; answered "n" to preserve it (piped via `printf 'n\n' | ...`). Both `chart.tsx` and `skeleton.tsx` were created successfully — a "Skipped 2 files" stdout line was a false-positive ordering artifact, confirmed by directory listing timestamps. The CLI's `pnpm add` also pulled in `recharts@3.8.0` as a side effect, satisfying most of 6.2 ahead of time.
- [x] 4.2 Verified `globals.css` already defines `--chart-1` through `--chart-5` HSL triplets (light theme ~line 84, dark theme ~line 120) plus `--color-chart-N: hsl(var(--chart-N))` mappings (~lines 23-27); confirmed via `rg` that no file under `src/` imported `recharts` before this phase.

## Phase 5: Averages & Chart (Slice B Core)

- [x] 5.1 Created `ServicioAveragesCard.tsx`: hosts the desde/hasta `<input type="date">` pair (state owned by `HistorialEstadisticasPage`, passed down as controlled props + setters), computes `averages` via `useMemo(() => computeServicioAverages(filterRecordsByDateRange(records, desde, hasta), servicioValues), [records, desde, hasta])`, and renders the chart. **Deviation, disclosed**: per design.md D5 and its data-flow diagram (Card "hosts chart" via `dynamic(ssr:false)`; Chart is explicitly "sole recharts importer"), `ServicioAveragesCard.tsx` itself does **not** import `recharts` — treated design.md as authoritative over this task's more ambiguous phrasing. Also, "button to filter" was implemented as a "Limpiar" (clear) button rather than an apply/submit trigger: since desde/hasta are live-controlled page-level state, every keystroke already re-triggers the memo, so no separate "apply" step is needed — the button only resets both fields to `''`.
- [x] 5.2 Created `ServicioAveragesChart.tsx`: the sole module in this feature importing `recharts` (`Bar`, `BarChart`, `CartesianGrid`, `Cell`, `XAxis`, `YAxis`). Builds a `ChartConfig` with one entry per servicio, each colored `hsl(var(--chart-${(index % 5) + 1}))` (cycling since there are 9 servicio values but only 5 theme colors) — no hardcoded hex. `ResponsiveContainer` is supplied internally by shadcn's `ChartContainer` wrapper rather than re-imported directly; satisfies "BarChart + ResponsiveContainer" structurally. Loaded exclusively via `next/dynamic(() => import('./ServicioAveragesChart'), { ssr: false, loading: () => <Skeleton /> })` from `ServicioAveragesCard.tsx`.
- [x] 5.3 Created `TopFaltantesCard.tsx`: renders `computeTopFaltantes()`'s fixed 90-day result (page-level memo, no `desde`/`hasta` in its dependency array, so the date-range filter structurally cannot reach it), one row per `{ nombre, categoria, missedCount }` plus `missedCount / servicesInWindow`. Implemented **two** empty states, not just the one named in this task: `servicesInWindow === 0` ("no hay servicios registrados en los últimos 90 días") and, additionally, `rows.length === 0` with `servicesInWindow > 0` ("todos los miembros asistieron") — added so a healthy zero-faltantes result doesn't render a misleadingly blank table.
- [x] 5.4 **Not run** — no interactive browser/dev-server tooling available in this execution environment; `npm run dev` click-through was not performed (same limitation disclosed for task 3.4 in Slice A). Verified equivalently via: `pnpm build` compiles and prerenders `/historial/estadisticas`; `pnpm test` passes; code review confirms the averages memo depends on `[records, desde, hasta]` while the faltantes memo depends only on `[data]` (miembros/records/today), so the two are structurally independent as required.

## Phase 6: Cleanup (Slice B Finishing)

- [x] 6.1 Deleted `src/features/historial/components/historial/StatsSummary.tsx`, `CategoryGrid.tsx`, `utils.ts` via `git rm` after confirming via `rg` that no importers remained anywhere under `src/`.
- [x] 6.2 `recharts@3.8.0` was already present in `package.json`/`pnpm-lock.yaml`, added automatically by the `pnpm add` the shadcn CLI ran during task 4.1 — no separate manual dependency-add step was needed. (Task text said "Run `npm install`"; this repo is pnpm-exclusive per explicit constraint, and the install already happened via pnpm.)

## Phase 7: Integration & Verification

- [x] 7.1 `pnpm type-check` and `pnpm lint` both pass clean. Getting there required two mechanical fixes to the newly-vendored (not pre-existing) `src/shared/ui/chart.tsx`/`skeleton.tsx`: ran `pnpm prettier --write` on those two files only (quote/semicolon style, matching this repo's `.prettierrc`) and changed one `!= null` to `!== null && ... !== undefined` (`eqeqeq` rule) in `chart.tsx`, with no behavior change. The 15 pre-existing files with prettier failures noted in prior context were left untouched.
- [x] 7.2 `pnpm build` succeeds; full `Route (app)` size table and bundle-isolation evidence recorded in `apply-progress.md`. Confirmed `recharts` appears only inside its own on-demand chunk (`react-loadable-manifest.json` entry keyed `"...ServicioAveragesCard.tsx -> ./ServicioAveragesChart"`), and is absent from `/historial`, `/historial/[id]`, `/historial/estadisticas`, and every shared framework chunk (`app-build-manifest.json` + direct `grep` across `.next/static/chunks/`). No `NaN` risk: `computeServicioAverages` already guarantees `0` (never `NaN`) for zero-record servicios, covered by an existing Slice A test.
- [x] 7.3 `pnpm test` passes: 299 tests / 23 suites green, including 4 new tests added this slice (2 malformed-`desde`/`hasta`-bound cases, 2 `AttendeeBuckets` key-set pins). Pre-existing `act()`/`aria-describedby` console warnings in unrelated dialog tests are unchanged noise, not failures.
- [x] 7.4 **Not run interactively** (no browser tooling in this environment) — same limitation as 5.4. Evidence gathered instead: (a) `/historial`'s entry link to `/historial/estadisticas` is unchanged from Slice A (already verified then); (b) the amigos table's rendering logic is untouched by this slice; (c) the averages/faltantes memo independence was confirmed by code review (see 5.4); (d) `RoleGuard requiredPermission="historial.view"` still wraps the page content, unchanged from Slice A.
- [x] 7.5 Confirmed via review of every diff in this slice: no `setDoc`/`updateDoc`/`addDoc`/`deleteDoc`/write call was introduced. `HistorialEstadisticasPage.tsx` now reads via `fetchHistorial()`, `fetchAmigos()`, and `fetchMiembros()` — all pre-existing read-only functions.

## Slice A Review Findings Folded Into Slice B

Four non-blocking findings from the Slice A review were addressed as part of this slice's `src/shared/lib/historial-stats.ts` changes (see `apply-progress.md` for full detail):

1. `AttendeeBuckets` tightened from `Partial<Record<string, MiembroSimplificado[]>>` to a closed union (`MiembroAsistioCategoria`), with a compile-time-pinning test using `@ts-expect-error`.
2. `filterRecordsByDateRange` now gives an explicit, tested behavior for a malformed `desde`/`hasta` bound (e.g. `'2026-13-01'`): treated exactly like an absent bound, never activating the range by itself.
3. `fetchHistorial()`'s unbounded full-collection read was left untouched — no data-layer redesign was introduced.
4. A `console.error` was added on `HistorialEstadisticasPage.tsx`'s catch path, alongside the existing user-facing error message.

