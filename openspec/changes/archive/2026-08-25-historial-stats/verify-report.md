```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:57e854c30415b90e0fda51a7d62248072875ff8ed824fb1b12a529fdb92ed857
verdict: pass_with_warnings
blockers: 0
critical_findings: 0
requirements: 9/9
scenarios: 13/13
test_command: pnpm test
test_exit_code: 0
test_output_hash: sha256:1226200d7a3d80ddeab6d8b208c79bb6de03efe9c67b2687c299364437359537
build_command: pnpm build
build_exit_code: 0
build_output_hash: sha256:aef5bea4000d77b0aaef3405ff4a46d013d518db6ddb7e3c068b3119f5166354
```

# Verification Report — FINAL VERIFICATION (Slice A + Slice B)

**Read this first**: this section supersedes the machine envelope of the
earlier Slice A-only pass. The prior Slice A report body is preserved below,
unmodified, under "Superseded: Slice A verification (historical)" for the
audit trail. All 9 requirements / 13 scenarios of the `historial-stats` spec
are now evaluated against the complete change (Slice A, PR #19, merged, +
Slice B, tasks phases 4-7, all 23/23 tasks complete); the machine envelope
above reflects the complete change (`requirements: 9/9`, `scenarios: 13/13`).

**Change**: historial-stats
**Version**: N/A (delta spec; `openspec/specs/historial-stats` did not exist
before this change)
**Mode**: Standard (no Strict TDD marker found in config/state)
**Scope of this pass**: FULL CHANGE — Slice A (tasks phases 1-3, merged as
PR #19) + Slice B (tasks phases 4-7, on branch `feat/historial-stats-slice-b`,
6 commits ahead of `main`, working tree clean except one pre-existing
untracked orphan, `src/__tests__/lib/sort-utils.test.ts`, unrelated to this
change and left untouched).

## Requirement / Scenario Count (verified by direct count, not copied)

`rg -c '^#### Scenario:' openspec/changes/historial-stats/specs/historial-stats/spec.md`
→ **13**. `rg -c '^### Requirement:'` → **9**. This resolves the drift noted
in prior artifacts: `state.yaml`'s inline comment said 13, the Slice A verify
pass directly counted 12, and requirement 8 was amended post-apply from one
scenario ("Historical Detail Quick-Stat Label Fix") to two ("Duplicate card
is gone" / "No attendee count is lost") under its new title "Historial
Detail Redundant Quick-Stat Removed". 12 (Slice A count) + 1 (requirement 8's
amendment) = **13**, matching this pass's direct count.

## Completeness

| Metric | Value |
|--------|-------|
| Tasks total (all phases) | 23 |
| Tasks complete | 23 |
| Tasks incomplete | 0 |

Every `[x]` in `tasks.md` (Phases 1-7) was cross-checked against source, not
trusted at face value. Phase 1-3 evidence was re-confirmed present and
unchanged (route, page shell, amigos table, normalizer adoption in both
existing historial pages). Phases 4-7 were verified fresh, detailed below.

## Build & Tests Execution (actual output, this pass)

**Tests** (`pnpm test`): PASS, exit code 0.
```text
Test Suites: 23 passed, 23 total
Tests:       299 passed, 299 total
Snapshots:   0 total
```
23 suites / 299 tests, matching `apply-progress.md`'s claim exactly. Includes
`src/__tests__/lib/historial-stats.test.ts` (42 `it(...)` cases across all 8
exported functions plus the `AttendeeBuckets` compile-time pin) and the
pre-existing untracked `sort-utils.test.ts` orphan (picked up by Jest's glob
regardless of git tracking — not authored or modified by this change).

**Build** (`pnpm build`): PASS, exit code 0.
```text
✓ Compiled successfully
✓ Generating static pages (19/19)
Route (app)                                 Size  First Load JS
├ ○ /historial                           9.86 kB         775 kB
├ ƒ /historial/[id]                      5.59 kB         771 kB
├ ○ /historial/estadisticas              9.17 kB         245 kB
```

**Type-check** (`pnpm type-check` → `tsc --noEmit`): PASS, zero output, exit
code 0. This is the run that enforces the `AttendeeBuckets` closed-union
compile-time pin (`@ts-expect-error` in the test file) — Jest's SWC
transform does not type-check, so only this command actually proves the pin.

**Lint** (`pnpm lint` → `next lint`): PASS — "No ESLint warnings or errors"
(same pre-existing, unrelated "multiple lockfiles" warning as before —
environment-level, not caused by this change).

**Coverage**: No threshold configured → Not available / N/A.

## Bundle Isolation — Requirement 1 (independently re-verified, not just trusted from apply-progress)

Parsed the real `.next/app-build-manifest.json` from this pass's own
`pnpm build` and collected every chunk eagerly loaded by `/historial`,
`/historial/[id]`, and `/historial/estadisticas` (25 unique chunk files).
`rg -l "recharts"` against every one of those 25 files: **zero matches**.

Separately, `rg -l "recharts" .next/static/chunks/*.js` finds it in exactly
two files: `4864.e7736dd148814d96.js` and `9382.108582e40b557734.js`.
`.next/react-loadable-manifest.json` confirms both belong to the single
`next/dynamic` entry `ServicioAveragesCard.tsx -> ./ServicioAveragesChart` —
i.e. the on-demand chunk fetched only once a user is on
`/historial/estadisticas` and the chart actually mounts. `recharts` is
absent from every eagerly-loaded chunk of every `/historial*` route and from
both shared framework chunks. **Requirement 1 confirmed independently.**

## Spec Compliance Matrix (all 9 requirements / 13 scenarios)

| # | Requirement | Scenario | Test / Evidence | Result |
|---|---|---|---|---|
| 1 | Estadísticas Route | Reaching the view without growing the list bundle | `.next/app-build-manifest.json` + chunk grep (above); route renders `○ /historial/estadisticas` at 245 kB vs. `/historial`'s 775 kB | ✅ COMPLIANT |
| 2 | Historial Record Normalization | Legacy record normalized and counted | `normalizeHistorialRecord` test: "resolves the legacy simpatizantes -> amigos fallback and counts it downstream"; adopted at both `historial/page.tsx` and `historial/[id]/page.tsx` (confirmed via `rg`) | ✅ COMPLIANT |
| 3 | Amigos Follow-up Table | Amigo with a recorded visit | test "reports the latest fecha/servicio and days-since for an amigo with visits" | ✅ COMPLIANT |
| 3 | Amigos Follow-up Table | Amigo never visited | test "shows nunca (null) for an amigo with zero appearances"; `AmigosSeguimientoTable` renders `nunca` last, same table | ✅ COMPLIANT |
| 3 | Amigos Follow-up Table | Date-range filter has no effect | `buildAmigosSeguimiento` takes no `desde`/`hasta` parameter at all; `amigosSeguimiento` memo in `HistorialEstadisticasPage.tsx` depends only on `[data]`, never on `desde`/`hasta` — structurally cannot be scoped, not just behaviorally | ✅ COMPLIANT |
| 4 | Per-Servicio Averages Chart | Servicio type with zero records shows no NaN, scoped by range | `computeServicioAverages` test "renders 0, never NaN, for a servicio with zero records" (`averageTotal: 0`, never `NaN`); range applied via `filterRecordsByDateRange` in the same memo | ✅ COMPLIANT — see WARNING 1 for a disclosed rendering-shape deviation from the literal scenario wording |
| 5 | Top Faltantes Ranking | Non-member excluded | test "excludes non-members (esMiembro false or absent)"; `computeTopFaltantes` filters `.filter(m => m.esMiembro === true)` | ✅ COMPLIANT |
| 5 | Top Faltantes Ranking | Records outside 90-day window excluded | tests "counts a record exactly 90 days ago as inside the window", "excludes a record 91 days ago from the window", "does not contribute a record outside the window even though it exists"; ranking has no `desde`/`hasta` dependency (fixed `windowDays = 90` default) | ✅ COMPLIANT |
| 6 | Pure Aggregation Helpers | Tests cover each helper | `historial-stats.ts` (392 lines, 8 functions + 7 exported types) has a 1:1 test file `historial-stats.test.ts` (450 lines, 42 `it(...)` cases) covering every export including legacy normalization and empty input | ✅ COMPLIANT |
| 7 | Orphaned Stats Code Removed | Dead files removed | `src/features/historial/components/historial/` no longer exists (`ls` → "No such file or directory") | ✅ COMPLIANT |
| 8 | Historial Detail Redundant Quick-Stat Removed | Duplicate card is gone | `[id]/page.tsx` quick-stat row is `grid grid-cols-1 sm:grid-cols-2`, exactly two cards ("Asistentes", "Faltantes"); `rg "Total Asistentes" src/` finds it only in unrelated PDF/Excel export column labels, never in this UI | ✅ COMPLIANT |
| 8 | Historial Detail Redundant Quick-Stat Removed | No attendee count is lost | "Asistentes" card renders `{asistentes.length}` (the record's own attendee count), unchanged by the card removal | ✅ COMPLIANT |
| 9 | Read-Only Behavior | No writes introduced | `rg "setDoc\|addDoc\|updateDoc\|deleteDoc\|writeBatch\|runTransaction"` across every file this change touches → zero matches; the stats view calls only `fetchHistorial()`, `fetchAmigos()`, `fetchMiembros()` | ✅ COMPLIANT |

**Compliance summary**: 13/13 scenarios compliant, 9/9 requirements
compliant. Zero scenarios untested or failing.

## Design Conformance (D1-D8)

| Decision | Followed? | Notes |
|---|---|---|
| D1 — client component, `Promise.all`, `RoleGuard` parity | ✅ Yes | `HistorialEstadisticasPage.tsx` matches `historial/page.tsx`'s `requiredPermission="historial.view"` gate; `Promise.all([fetchHistorial(), fetchMiembros(), fetchAmigos()])` |
| D2 — helpers import only types from `@/shared/types` | ✅ Yes | `historial-stats.ts` has zero value-imports of `shared/firebase` or `shared/lib/firebase` |
| D3 — `computeServicioAverages` receives the 9 enum values; labels stay in the view | ⚠️ **Deviated, disclosed, spec-serving** | See WARNING 1 below — the shipped fix passes `servicios.map(s => s.label)` instead, because production data is stored keyed by label, not enum value. `design.md` was not updated to reflect this (unlike its File Changes row, which *was* amended for the requirement 8 fix) |
| D4 — `today` as injected `'YYYY-MM-DD'`, epoch-day math | ✅ Yes | `todayISODate`/`toEpochDay` unchanged from Slice A, still local-getter/epoch-day based, no `toISOString().split('T')[0]` |
| D5 — `chart.tsx` (shadcn) + `ServicioAveragesChart.tsx` sole recharts importer, `next/dynamic(ssr:false)` | ✅ Yes | Confirmed via `rg -l "from 'recharts'" src/` → only `ServicioAveragesChart.tsx` and the vendored `shared/ui/chart.tsx` primitive; loaded via `dynamic(() => import('./ServicioAveragesChart'), { ssr: false, loading: () => <Skeleton /> })` |
| D6 — semantic `<table>` in a `Card`, no shadcn table primitive | ✅ Yes | `AmigosSeguimientoTable.tsx` and `TopFaltantesCard.tsx` both use plain `<table>` |
| D7 — `desde`/`hasta` scoped to the averages memo only | ✅ Yes | `amigosSeguimiento` and `topFaltantes` memos depend only on `[data]`; only `ServicioAveragesCard`'s memo depends on `[records, desde, hasta]` |
| D8 — unit-test every helper export; views verified by build + manual | ⚠️ Partial | Unit tests: done, exceeds design intent. Manual `npm run dev` click-through (tasks 5.4/7.4): **not run** — no browser/dev-server tooling in this sandboxed environment, disclosed inline in `tasks.md`/`apply-progress.md`, same limitation as Slice A's task 3.4. Substituted with build/chunk/code-review evidence throughout this report |

## Invariant Checks (from the verification brief)

| Invariant | Result | Evidence |
|---|---|---|
| Date range reaches only the averages memo; amigos all-time, faltantes fixed 90d, separate `useMemo`s | ✅ Confirmed | `HistorialEstadisticasPage.tsx`: `amigosSeguimiento` and `topFaltantes` memos both depend on `[data]` only; `ServicioAveragesCard`'s internal memo is the only one taking `desde`/`hasta` |
| `ServicioAveragesChart.tsx` sole `recharts` importer, loaded via `next/dynamic(ssr:false)` | ✅ Confirmed | Plus bundle-isolation proof above |
| `AttendeeBuckets` closed key union, compile-time-pinned | ✅ Confirmed | `MiembroAsistioCategoria` closed union; `@ts-expect-error` test only fires under `tsc --noEmit`, which passed |
| `filterRecordsByDateRange` treats a malformed bound as absent, tested | ✅ Confirmed | Tests "treats a lone malformed bound as absent, returning all rows unchanged" and "ignores a malformed bound while still applying the other, valid bound" |
| `RoleGuard requiredPermission="historial.view"` still wraps the page; loading/error branches intact incl. `console.error` | ✅ Confirmed | `HistorialEstadisticasPage.tsx` lines 50/93 |
| Read-only: no Firestore write anywhere in the change | ✅ Confirmed | See Requirement 9 row above |
| Orphaned `src/features/historial/components/historial/*` gone | ✅ Confirmed | Directory does not exist |
| Desktop-first redesign: `max-w-7xl`, responsive plot height, `maxBarSize`, `xl:grid-cols-2` amigos-left | ✅ Confirmed **from source only** | `mx-auto w-full max-w-7xl`; `CHART_FRAME_CLASS = 'h-[260px] w-full sm:h-[300px] lg:h-[360px]'`; `<Bar ... maxBarSize={88}>`; `grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2`, `AmigosSeguimientoTable` before `TopFaltantesCard` in JSX (left in LTR); reading order promedios → amigos → faltantes matches the page's card order. **Not visually observed** — no browser tooling available in this environment; this is reasoned from source and Tailwind class semantics, not a rendered screenshot |

## Servicio Label vs. Enum Bug Fix — verified against production evidence claim

`buildConteoData` (`src/features/asistencia/lib/calculations.ts:291`) writes
`servicios.find(s => s.value === conteoState.tipoServicio)?.label || conteoState.tipoServicio`
— confirmed by direct read: historial records store the servicio **label**
(or, for a manually-typed servicio, the raw string verbatim), never the
enum `value`. `ServicioAveragesCard.tsx` now computes
`servicioLabels = servicios.map(s => s.label)` and feeds that into
`computeServicioAverages`, then filters `.filter(row => row.recordCount > 0)`
before charting — confirmed by direct read of both files. This matches the
brief's described root cause and fix exactly.

**`ConteoHeader.tsx` free-text path, confirmed**: the servicio `<Select>`
includes an `"Agregar servicio..."` (`value="manual"`) option backed by
`showServicioInput`/`servicioManual` state, i.e. a genuine manual free-text
entry path exists at creation time — independently confirming that a
"servicio" is not strictly confined to the 9-value enum.

## Exploration Document Accuracy (flagged per the verification brief)

`openspec/changes/historial-stats/exploration.md` line 20 states: *"`servicio`
is created from a fixed 9-value enum... it is not free text at creation."*
Both halves of this claim are **false**, confirmed by direct code
inspection:
1. `ConteoHeader.tsx`'s `"Agregar servicio..."` option is exactly a free-text
   entry path at creation time (see above).
2. Even for the enum-selected path, `buildConteoData` writes the resolved
   **label** string, not the enum `value` — so nothing downstream (including
   this change's own helpers) can treat a historial record's `servicio`
   field as one of the 9 canonical enum tokens. This was the literal root
   cause of the chart bug this slice fixed.

`exploration.md` predates that discovery and was not corrected after the
fact (unlike `spec.md`/`design.md`/`tasks.md`, which were amended for the
requirement 8 change). It should not be treated as authoritative for the
servicio field's shape in any future work on this area — flagged here as
SUGGESTION 1.

## Regression Sweep

| Area | Check | Result |
|---|---|---|
| `historial/page.tsx` normalizer adoption | inline `??` chains replaced, entry link added | Confirmed present, unchanged from Slice A |
| `historial/[id]/page.tsx` | normalizer adopted; quick-stat grid now 2-column; `allMembers` (2 uses) and the record's own `asistentes` remain referenced, no unused variable | Confirmed via `rg` |
| Full regression test run | `pnpm test` | 23/23 suites, 299/299 tests pass, including pre-existing amigos/asistencia/auth/export suites |
| `card.tsx` preservation | `git diff main -- src/shared/ui/card.tsx` | Empty diff — the shadcn CLI's prompted overwrite was correctly declined, as claimed in `tasks.md` 4.1 |
| `--chart-1`..`--chart-5` CSS vars | `rg "--chart-1|--chart-5" src/app/globals.css` | Present in both light and dark theme blocks, pre-existing, no new CSS needed |

## Known Context (not findings)

- `src/__tests__/lib/sort-utils.test.ts` is a pre-existing untracked orphan
  from an unrelated earlier session; confirmed unrelated to `historial-stats`
  and left untouched by this verification pass, per explicit instruction.
- `state.yaml`'s `delivery_resolution.size_exception_slice_b` records an
  owner-granted `size:exception` for Slice B (forecast ~1400 lines vs. the
  800-line budget) — a pre-existing, already-resolved delivery decision, not
  a finding of this pass.
- Receipt-driven review (Gentle AI RDD) is disabled for this clone at the
  owner's explicit request; `reviewGate` is structurally absent from
  dispatcher status. Delivery is governed by ordinary repository policy
  (PR #21 and its checks). This absence is not treated as a finding.

## Issues Found

**CRITICAL**: None.

**WARNING**:
1. **`design.md` D3 is stale relative to the shipped, spec-serving fix.**
   D3 states `computeServicioAverages(rows, servicioValues)` "receives the 9
   enum values." The actual, correct, tested implementation instead passes
   `servicios.map(s => s.label)` — the 9 servicio **labels** — because
   production historial records are keyed by label, not enum value (see
   "Servicio Label vs. Enum Bug Fix" above). The fix itself is correct,
   root-cause-informed, and unit-tested; the issue is purely that
   `design.md` was not amended to document it, unlike the File Changes row
   that *was* updated for the requirement 8 card-removal fix. Recommend
   amending D3 before archive so the design record matches the shipped
   code, consistent with how requirement 8's amendment was handled.

**SUGGESTION**:
1. `exploration.md` line 20 makes a false claim about the servicio field's
   shape ("not free text at creation," "fixed 9-value enum") — see
   "Exploration Document Accuracy" above. Recommend a correcting note before
   this document is used as a reference in future historial-related change
   proposals.
2. Spec requirement 4 / scenario "Servicio type with zero records shows no
   NaN, scoped by range" is worded for the pre-fix data model (a zero-record
   servicio rendering an individual "empty" chart entry). The shipped fix
   instead *omits* zero-record servicios from the chart entirely and shows
   one aggregate empty-state message only when every servicio is empty. The
   requirement's underlying intent (never `NaN`, no misleading rendering) is
   fully served and unit-tested, but the scenario text should be reworded
   in a future documentation pass to describe the omit-based behavior
   precisely, rather than an inline per-entry empty state.
3. `state.yaml`'s `phases:` block (`apply: in_progress`, `verify: partial`,
   `archive: pending`) is stale relative to the actual state (23/23 tasks
   complete, both slices verified by this pass). Not corrected here per
   explicit instruction that `state.yaml` is orchestrator-owned; flagged for
   the orchestrator to reconcile before `sdd-archive`.
4. No interactive browser/dev-server verification exists for this change
   (tasks 5.4/7.4, disclosed). Every layout/visual claim in this report
   (responsive plot height, `xl` side-by-side card layout, empty-state
   appearance, chart bar sizing) is reasoned from source code, Tailwind
   class semantics, and the production build's static output — not
   observed in a rendered browser. This mirrors the Slice A precedent and
   is a known environment constraint, not a code defect.

## Verdict

**Machine envelope**: `pass_with_warnings` — `requirements: 9/9`,
`scenarios: 13/13`, `blockers: 0`, `critical_findings: 0`. The full
`historial-stats` change (Slice A + Slice B) is realized and verified with
real execution evidence (test/build/type-check/lint all exit 0), not source
inspection alone.

**Human read**: PASS WITH WARNINGS. All 23 tasks (Phases 1-7) are
implemented as claimed and match design decisions D1, D2, D4-D7 exactly; D3
and D8 have disclosed, spec-serving deviations (see above). All 13 scenarios
across the 9 requirements are compliant, backed by passing automated tests
for every testable claim (299 tests, 23 suites, plus independent chunk-manifest
proof of bundle isolation). Zero CRITICAL findings. Zero regressions found in
the sweep. The one WARNING is a documentation-currency gap (`design.md` D3),
not a code defect — the code itself is correct and matches the disclosed,
root-cause-informed bug fix.

**Recommendation**: `sdd-archive` is appropriate once `design.md` D3 is
amended to match the shipped fix (WARNING 1) and `state.yaml` phase markers
are reconciled by the orchestrator (SUGGESTION 3). Neither blocks on code
correctness — both are documentation-currency items.

---

## Superseded: Slice A verification (historical)

The Slice A-only verification pass (tasks phases 1-3, PR #19) previously
reported here concluded: 0 CRITICAL findings, 0 WARNING findings, 3
SUGGESTIONs; build/type-check/lint/test all PASS (23 suites / 295 tests at
that time); all 11 Phase 1-3 tasks confirmed against source; D1, D2, D4, D6,
D8 followed for the Slice A-relevant subset. That pass's machine envelope
would have reported `requirements: 4/9`, `scenarios: 5/12` (by its own
direct count of 12 scenarios, before requirement 8's later amendment added a
13th) — an accurate reflection that Slice B was, by design, not yet started
(chained-PR strategy). Its SUGGESTION 1 (scenario-count drift, 12 vs. the
13 claimed elsewhere) is now resolved by this pass's direct recount above.
Its SUGGESTION 3 (no standalone `apply-progress` artifact) is resolved:
`apply-progress.md` now exists and was the primary evidence source for
Slice B's task-completion claims in this pass.

The full text of that historical pass is preserved verbatim below for audit
purposes.

<details>
<summary>Original Slice A-only verify-report.md body (click to expand)</summary>

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

</details>
