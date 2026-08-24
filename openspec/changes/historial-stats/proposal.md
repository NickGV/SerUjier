# Proposal: Estadísticas de Historial

## Intent

Historial answers "what happened at one service" only. It cannot answer what the team acts on — **how long each amigo has not come back** (the driver: visitor follow-up), which servicio types are healthy, which members keep missing. The only aggregate today is promedio/máximo/mínimo of `total`, buried in a 1164-line list page.

## Scope

### In Scope

- New **Estadísticas** view under historial, on its own route segment (own bundle; list page not grown).
- **Seguimiento de amigos** (flagship): per amigo, last attended fecha + servicio and days since; stalest first; amigos with no record stay in the SAME table, sorted last, shown as "nunca" (owner-confirmed).
- **Promedio por tipo de culto**: average attendance + record count per each of the 9 `servicio` values (bar chart).
- **Top faltantes de miembros**: `esMiembro: true` miembros ranked by services missed in the last 90 days.
- Pure helpers in `src/shared/lib/historial-stats.ts` + one shared `normalizeHistorialRecord` (legacy `simpatizantes` fallback), 1:1 tests under `src/__tests__/lib/` (`miembros-filters.ts` precedent).
- `recharts` + shadcn chart primitive via `next/dynamic(..., { ssr: false })`, stats view only.
- Date-range filter (desde/hasta) in the stats view, owner-confirmed for v1: scopes per-servicio averages and the chart. The faltantes window stays fixed at 90 days, and amigos last-visit stays all-time (a date filter would make "hace cuánto no nos visita" meaningless).
- Cleanup: delete orphaned `src/features/historial/components/historial/*`; fix the `historial/[id]` card labeled "Total Asistentes" that renders total registered miembros.

### Out of Scope

- Tendencia en el tiempo; miembros vs no-miembros (deselected for v1).
- Consolidating legacy historial CRUD (`shared/lib/utils.ts` → `shared/firebase/historial.ts`): behavior-preserving refactor of live list/delete/export paths, deferred to protect this change's review budget.
- Any Firestore write, schema, migration, or rules change.

## Capabilities

### New Capabilities

- `historial-stats`: attendance statistics surfaces in historial — the Estadísticas view (amigos follow-up, per-servicio averages, top faltantes) and correct labeling of per-record stat cards.

### Modified Capabilities

- None.

## Approach

Read-only client aggregation. The view fetches `fetchHistorial()` (canonical module), `fetchMiembros()` and `fetchAmigos()` in one `Promise.all`, maps records through `normalizeHistorialRecord`, then feeds framework-free pure functions. Faltantes/membership use **current** data (no historical snapshot exists), matching `historial/[id]` today. Amigos last-visit joins `amigosAsistieron` ids against amigos and is always all-time — "hace cuánto no nos visita" must be absolute. A dedicated route segment code-splits without adding a Tabs primitive; recharts stays dynamic so the amigos table paints before the chart chunk.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/(dashboard)/historial/estadisticas/` | New | Route + view components |
| `src/shared/lib/historial-stats.ts` (+ test) | New | Pure aggregations, normalizer |
| `src/shared/ui/chart.tsx` | New | shadcn chart primitive |
| `historial/page.tsx`, `historial/[id]/page.tsx` | Modified | Entry link, label fix, shared normalizer |
| `src/features/historial/components/historial/*` | Removed | Dead duplicate stats logic |
| `package.json` | Modified | `recharts` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| recharts penalizes the historial list bundle | Med | Separate route + dynamic import; check list chunk in `npm run build` |
| Faltantes across all 9 servicio types penalizes Sunday-only members | High | Show missed count vs services in window; rule confirmed in question round |
| Current-membership skews older records | Med | Documented; matches existing behavior; 90-day window |
| Legacy `simpatizantes` records miscounted | Med | Single tested normalizer with legacy + current fixtures |
| Exceeds the 800-line review budget | Med | Slice A = helpers, tests, route, amigos table; Slice B = chart, cleanup, label fix |

## Rollback Plan

- **No data migration to reverse**: read-only aggregation — no Firestore writes, no new fields, no backfill, no rules change. Reverting code fully restores prior behavior.
- Revert the PR (Slice B then A if chained); deleted orphan files return from git history.
- Partial: remove `historial/estadisticas/` and its entry link — the rest is additive and inert.
- Dependency: `npm uninstall recharts` + lockfile revert. Label fix and normalizer adoption revert independently.

## Dependencies

- `recharts` (new) + shadcn chart primitive; existing `fetchMiembros` / `fetchAmigos`; `esMiembro` from the merged `member-tag` change.

## Success Criteria

- [ ] Estadísticas view reachable from historial, rendering the three v1 stats.
- [ ] Every amigo appears exactly once in a single table — last fecha + servicio and days since, or sorted last showing "nunca".
- [ ] All 9 servicio values covered with record counts; empty types show an empty state, never `NaN`.
- [ ] Faltantes limited to the last 90 days and to `esMiembro: true`.
- [ ] Legacy `simpatizantes` records counted correctly by the tested normalizer.
- [ ] No chart code in the historial list chunk; `historial/[id]` label matches its value.
- [ ] `npm test` and `npm run build` pass; `src/features/historial/components/historial/` gone.
