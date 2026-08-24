# Verify Report: historial-stats — **SLICE A verification**

> Scope: tasks.md Phases 1-3 only (helpers/tests, route + page shell, amigos table + normalizer adoption).
> Phases 4-7 (chart primitive, per-servicio averages chart, date-range filter UI, top faltantes UI,
> orphan cleanup, `[id]` "Total Asistentes" label fix) are Slice B and are **intentionally not
> implemented**. Their absence is not a finding. A second verify report is expected after Slice B lands.

## Verdict: **PASS**

- CRITICAL: 0
- WARNING: 0
- SUGGESTION: 3

## Task Completion (Phases 1-3)

| Task | Status | Evidence |
|---|---|---|
| 1.1 Create `historial-stats.ts` with pure helpers | DONE | file present, 371 lines, all 8 functions + 7 types exported |
| 1.2 Create `historial-stats.test.ts` | DONE | 411 lines, 38 tests, covers every export incl. legacy-normalization + empty-input cases |
| 1.3 Verify test coverage | DONE | `npm test -- historial-stats` → 38/38 pass; module loads with zero Firebase side-effects (no value-import of `shared/firebase/*` or `shared/lib/firebase`) |
| 2.1 Create route re-export | DONE | `src/app/(dashboard)/historial/estadisticas/page.tsx` is a 1-line re-export |
| 2.2 Create `HistorialEstadisticasPage.tsx` | DONE (disclosed partial scope) | `RoleGuard requiredPermission="historial.view"`, one `useEffect` + `Promise.all([fetchHistorial(), fetchAmigos()])`, normalizes records, stores `{records, amigos, today}`. Averages/faltantes `useMemo`s correctly deferred to Slice B; `fetchMiembros()` is likewise deferred to Slice B (added with the card that consumes it) so this view issues no unused query — confirmed by reading the file |
| 2.3 Verify route segment | DONE | `npm run build` shows `○ /historial/estadisticas` as a static route, 4.39 kB / 238 kB First Load JS |
| 3.1 Create `AmigosSeguimientoTable.tsx` | DONE | single semantic `<table>` in a `Card`, columns nombre / última visita / días sin visitar, `overflow-x-auto` |
| 3.2 Update `historial/page.tsx` | DONE | entry `Link` + `BarChart3` icon to `/historial/estadisticas` (verified at page.tsx:639-648); inline `??` chain replaced by `normalizeHistorialRecord()` in both the initial load and the post-delete reload paths |
| 3.3 Update `[id]/page.tsx` | DONE (a), explicitly NOT done (b), as disclosed | (a) `normalizeHistorialRecord()` adopted at fetch, confirmed via diff; (b) "Total Asistentes" still reads `allMembers.length` (confirmed via `rg`) — deliberately deferred to Slice B per apply agent's inline note and orchestrator scope instruction |
| 3.4 Verify via code review + automated checks | DONE | confirmed independently: 38-test suite covers stalest-first + `nunca`; `npm run build` confirms route + entry link |

No Phase 1-3 task is left unchecked or misrepresented. The one intentional scope deviation (3.3b) is disclosed both in tasks.md and reconfirmed here by direct inspection — not a hidden gap.

## Requirement / Scenario Compliance (Slice A scope)

Spec file has **9 requirements / 12 scenarios** (direct count via `rg -c '^#### Scenario:'`; the orchestrator brief and state.yaml say "13 scenarios" — off by one, see Suggestion 1).

| # | Requirement | Scenario(s) | Status |
|---|---|---|---|
| 1 | Estadísticas Route | Reaching the view without growing the list bundle | PASS — route coexists with `[id]`, own chunk (238 kB) vs list (781 kB); no `recharts` string anywhere in `.next/static/chunks` (trivially true pre-Slice B; re-verify once recharts lands) |
| 2 | Historial Record Normalization | Legacy record normalized and counted | PASS — single `normalizeHistorialRecord`, adopted by both pages, `git diff` confirms byte-for-byte equivalent fallback logic (`amigos ?? simpatizantes ?? 0`, `amigosAsistieron ?? simpatizantesAsistieron ?? visitasAsistieron ?? []`, `heRestauracion \|\| 0`, `hermanosVisitas \|\| 0`) |
| 3 | Amigos Follow-up Table (flagship) | Amigo with recorded visit / Amigo never visited / Date-range filter has no effect | PASS — one table, one row per amigo (unit-tested), stalest-first sort, `nunca` last in the *same* table (not a separate group), no `desde`/`hasta` state exists yet in Slice A so the table structurally cannot be scoped |
| 4 | Per-Servicio Averages Chart | Servicio zero-records / no NaN | DEFERRED to Slice B — `ServicioAveragesCard/Chart` not created; correct for this slice |
| 5 | Top Faltantes Ranking | Non-member excluded / 90-day window excluded | DEFERRED to Slice B for the **UI** — `TopFaltantesCard` not created (correct); the underlying pure helper `computeTopFaltantes` is already implemented and unit-tested ahead of schedule (see state.yaml rationale: Slice B's pure calc was front-loaded into the same module) |
| 6 | Pure Aggregation Helpers | Tests cover each helper | PASS — all 8 functions present in `historial-stats.ts`, one 1:1 test file with 38 passing tests, no Firebase value-imports |
| 7 | Orphaned Stats Code Removed | Dead files removed | DEFERRED to Slice B — `StatsSummary.tsx`, `CategoryGrid.tsx`, `utils.ts` still present, confirmed via `ls` (correct, Phase 6 task) |
| 8 | Historial Detail Quick-Stat Label Fix | Card shows record's own attendee count | DEFERRED to Slice B — `[id]/page.tsx` still renders `allMembers.length`, confirmed via `rg` |
| 9 | Read-Only Behavior | No writes introduced | PASS — `rg` for `addDoc\|updateDoc\|deleteDoc\|setDoc\|writeBatch\|runTransaction` across all new/modified files returns zero matches; the stats view calls only `fetchHistorial()` and `fetchAmigos()` (`fetchMiembros()` arrives with Slice B), and the two existing historial pages keep their prior read calls |

## Design Conformance (D1-D8, Slice A-relevant subset)

- **D1** (client component, `Promise.all`, `RoleGuard` parity): confirmed — `HistorialEstadisticasPage.tsx` matches `historial/page.tsx`'s `requiredPermission="historial.view"` gate style exactly.
- **D2** (helpers import only types from `@/shared/types`, no Firebase value-import): confirmed by reading `historial-stats.ts` imports — only `import type { Miembro, MiembroSimplificado } from '@/shared/types'`; zero occurrences of `shared/firebase` or `shared/lib/firebase` as value-imports.
- **D4** (deterministic date math, epoch-day, never `toISOString().split('T')[0]`): confirmed — `todayISODate` uses `getFullYear/getMonth/getDate` local getters; `toEpochDay` uses `Date.UTC(...)` with a round-trip validity check. Test `'never shifts to the next UTC day for a late-evening local time'` pins `new Date(2026, 5, 15, 23, 30)` → `'2026-06-15'`, directly guarding against the off-by-one bug design D4 calls out at `historial/page.tsx:309` (pre-existing, unrelated code, untouched by this slice).
- **D6** (semantic `<table>` in a `Card`, no shadcn table primitive): confirmed in `AmigosSeguimientoTable.tsx`.
- **D8** (unit-test every helper export, no RTL/Firestore mocks): confirmed — pure jest tests with injected `today`, no mocks.

## Verification Evidence (actual command output)

**`npm test -- historial-stats`**
```
PASS src/__tests__/lib/historial-stats.test.ts
Test Suites: 1 passed, 1 total
Tests:       38 passed, 38 total
Time:        0.259 s
```

**`npm test` (full regression sweep)**
```
Test Suites: 23 passed, 23 total
Tests:       295 passed, 295 total
Snapshots:   0 total
Time:        1.59 s
```
(Only stderr noise: pre-existing `@radix-ui/react-dialog` `aria-describedby` console warnings in an unrelated `AmigosFormDialog` test — not caused by this change.)

**`npm run build`**
```
✓ Compiled successfully in 2000ms
Route (app)                                 Size  First Load JS
├ ○ /historial                           9.81 kB         781 kB
├ ƒ /historial/[id]                      5.59 kB         776 kB
├ ○ /historial/estadisticas              4.39 kB         238 kB
```
`/historial/estadisticas` is `○` (static), coexists with `ƒ /historial/[id]`, and is its own chunk at roughly a third of the list route's First Load JS. `rg -l "recharts" .next/static/chunks/` → 0 matches (exit 1).

**`npm run type-check`** → `tsc --noEmit`, zero output, exit 0 (no errors).

**`npm run lint`** → `✔ No ESLint warnings or errors`.

## Regression Sweep

- `git diff` on both modified pages shows only the normalizer-adoption + entry-link/import changes; the delete-and-reload path in `historial/page.tsx` and the fetch path in `[id]/page.tsx` were re-diffed line-by-line — no unrelated logic touched.
- Full `npm test` (295 tests / 23 suites) passes, including pre-existing historial list/detail, export (Excel/PDF/CSV), and delete-flow tests — none regressed by the normalizer adoption.
- `package.json` / `package-lock.json`: no `recharts` entry (`rg -n "recharts"` → 0 matches) — no new dependency introduced in this slice, as expected.
- Orphan files (`StatsSummary.tsx`, `CategoryGrid.tsx`, `utils.ts` under `features/historial/components/historial/`) untouched, confirmed still present (correct — Phase 6/Slice B scope).

## Known Context (not findings)

- `src/__tests__/lib/sort-utils.test.ts` is a pre-existing untracked orphan from an unrelated earlier session; unrelated to this change.
- Slice A landed at **1163 changed lines** vs. the 800-line review budget (52 diff lines in the two modified pages + 1012 lines across the five new files). The owner explicitly granted a `size:exception` for PR 1 / Slice A, recorded in `state.yaml` (`delivery_resolution.size_exception`), rationale: 782 of the 1163 lines are the pure helper module plus its 38-test suite, front-loading Slice B's pure calculations into one cohesive tested module rather than splitting already-verified work. This is disclosed context, not a defect.

## Findings

No CRITICAL or WARNING findings.

### SUGGESTION

1. **Scenario-count drift in state.yaml.** The spec comment in `state.yaml` (`# 9 requirements / 13 scenarios`) and the orchestrator brief both say 13 scenarios; a direct count of `#### Scenario:` headings in `specs/historial-stats/spec.md` yields **12**. Purely a documentation nit — recommend correcting the inline comment before archive.
2. **Test-name off-by-one wording (not a logic bug).** In `computeTopFaltantes`'s window-boundary tests, the descriptions `'counts a record exactly 90 days ago as inside the window'` / `'excludes a record 91 days ago from the window'` use `recordOnDaysAgo(89, ...)` / `recordOnDaysAgo(90, ...)` respectively. The actual epoch-day boundary tested (`windowStart = today - 89`, inclusive) exactly matches design D4/D-rules ("`[today - (windowDays - 1), today]`"), so the *behavior* is correctly pinned at both edges — only the English test-name phrasing ("90 days ago" vs. the 90th day counted inclusively) is slightly imprecise. Cosmetic; no change to test assertions needed.
3. **No standalone `apply-progress` artifact exists** in the openspec change folder; `tasks.md`'s inline deferral notes on 2.2 and 3.3b served that role well and were independently reproducible against the code (both deferrals confirmed by direct inspection). Recommend keeping this inline-disclosure pattern for future slices — it made this verification straightforward.

## Next Recommended

`sdd-archive` is **not** appropriate yet — Slice B (Phases 4-7) is still pending per `state.yaml` (`apply: pending` for the remaining phases; the change is not complete). Recommended next phase: **`sdd-apply`** to continue with Slice B (chart primitive, averages chart, date-range filter, top-faltantes UI, orphan cleanup, `[id]` label fix), followed by a second `sdd-verify` pass and then `sdd-archive`.
