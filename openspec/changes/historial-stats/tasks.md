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
- [x] 3.3 Update `src/app/(dashboard)/historial/[id]/page.tsx`: (a) adopt `normalizeHistorialRecord()` at fetch. **(b) explicitly NOT done this slice**: the "Total Asistentes" `allMembers.length` → `asistentes.length` fix was named by the orchestrator as Slice B scope ("[id] label fix"), so it is deliberately left as-is here despite tasks.md listing it under 3.3. Disclosed as a risk/deviation.
- [x] 3.4 Verified via code review + automated checks: `buildAmigosSeguimiento` test suite covers stalest-first sort and "nunca" placement; `npm run build` confirms the `/historial/estadisticas` route compiles and the entry link renders in `historial/page.tsx`. (Interactive `npm run dev` click-through was not run; not in the mandated automated verification list for this phase.)

## Phase 4: Chart Primitives (Slice B Foundation)

- [ ] 4.1 Run `npx shadcn@latest add chart skeleton` to install `src/shared/ui/chart.tsx` and `src/shared/ui/skeleton.tsx`. Verify `chart.tsx` is created with no errors.
- [ ] 4.2 Verify `globals.css` contains `--chart-1` through `--chart-5` HSL triplets; confirm no existing recharts imports in the repo.

## Phase 5: Averages & Chart (Slice B Core)

- [ ] 5.1 Create `src/features/historial/components/estadisticas/ServicioAveragesCard.tsx`: desde/hasta date inputs (`useState('')` in page-level, passed down), button to filter, calls `filterRecordsByDateRange()` + `computeServicioAverages()` inside a memo, renders bar chart. Only module that imports recharts.
- [ ] 5.2 Create `src/features/historial/components/estadisticas/ServicioAveragesChart.tsx`: recharts `BarChart` + `ResponsiveContainer`, chartConfig with `hsl(var(--chart-N))` colors (no hardcoded hex), `Skeleton` loading fallback via `next/dynamic(ssr:false)`.
- [ ] 5.3 Create `src/features/historial/components/estadisticas/TopFaltantesCard.tsx`: calls `computeTopFaltantes()` (fixed 90d window, not scoped by date filter), renders rows = { nombre, categoria, missedCount, servicesInWindow }. `servicesInWindow === 0` → empty state.
- [ ] 5.4 Verify `npm run dev` → chart renders with date range filter; TopFaltantesCard renders 90-day data unaffected by date filter.

## Phase 6: Cleanup (Slice B Finishing)

- [ ] 6.1 Delete `src/features/historial/components/historial/StatsSummary.tsx`, `CategoryGrid.tsx`, `utils.ts` (orphaned; ~410 lines). Confirm no imports remain.
- [ ] 6.2 Update `package.json` to add `recharts` dependency (version TBD, e.g., latest stable). Run `npm install`.

## Phase 7: Integration & Verification

- [ ] 7.1 Run `npm run type-check` and `npm run lint` — no errors.
- [ ] 7.2 Run `npm run build` and inspect output chunk names; confirm recharts is NOT in the `historial/page` chunk (should be isolated to `estadisticas`). Verify no NaN in chart data.
- [ ] 7.3 Run `npm test` and verify full suite passes (including new historial-stats tests).
- [ ] 7.4 Manual sanity: (a) navigate `/historial` → verify entry link present; (b) navigate `/historial/estadisticas` → amigos table renders; (c) set date range → verify chart updates, amigos & faltantes unchanged; (d) verify access denied without `historial.view` permission.
- [ ] 7.5 Confirm no Firestore writes are introduced — all reads via `fetchHistorial()`, `fetchMiembros()`, `fetchAmigos()`.

