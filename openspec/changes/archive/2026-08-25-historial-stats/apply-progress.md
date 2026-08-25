# Apply Progress — historial-stats (Slice B: tasks phases 4-7)

Scope: `tasks.md` phases 4-7 only (Slice A / phases 1-3 already merged as PR #19).
Delivery: single PR, `size:exception` pre-granted for Slice B (`state.yaml`
`delivery_resolution.size_exception_slice_b`) — not split into chained PRs.

## Status: all phase 4-7 tasks completed

See `tasks.md` for the per-task `[x]` marks and inline deviation disclosures.
Two tasks (5.4, 7.4) could not be run interactively — no browser/dev-server
tooling is available in this execution environment — and were verified by
equivalent static/code-review evidence instead, disclosed inline in `tasks.md`.

## Files changed

### Created
- `src/shared/ui/chart.tsx` — vendored via `pnpm dlx shadcn@latest add chart`
- `src/shared/ui/skeleton.tsx` — vendored via the same shadcn command
- `src/features/historial/components/estadisticas/ServicioAveragesChart.tsx` — sole `recharts` importer
- `src/features/historial/components/estadisticas/ServicioAveragesCard.tsx` — date-range inputs + memoized averages, hosts the chart via `next/dynamic(ssr:false)`
- `src/features/historial/components/estadisticas/TopFaltantesCard.tsx` — fixed 90-day faltantes ranking

### Modified
- `src/shared/lib/historial-stats.ts` — tightened `AttendeeBuckets` to a closed union (review finding #1); gave `filterRecordsByDateRange` explicit malformed-bound behavior (review finding #2)
- `src/__tests__/lib/historial-stats.test.ts` — added 4 tests (2 malformed-bound, 2 `AttendeeBuckets` key-pin)
- `src/features/historial/pages/HistorialEstadisticasPage.tsx` — added `fetchMiembros()` to the `Promise.all`, added `desde`/`hasta` state, wired in `ServicioAveragesCard`/`TopFaltantesCard`, added `console.error` on the catch path (review finding #4)
- `src/app/(dashboard)/historial/[id]/page.tsx` — fixed "Total Asistentes" card to render `asistentes.length` instead of `allMembers.length`
- `package.json`, `pnpm-lock.yaml` — added `recharts@3.8.0` (via the shadcn CLI's own `pnpm add`, not a separate manual step)

### Deleted
- `src/features/historial/components/historial/CategoryGrid.tsx`
- `src/features/historial/components/historial/StatsSummary.tsx`
- `src/features/historial/components/historial/utils.ts`

## Review findings folded in (from Slice A review)

1. **`AttendeeBuckets` closed union** — tightened from `Partial<Record<string, MiembroSimplificado[]>>` to `Partial<Record<MiembroAsistioCategoria, MiembroSimplificado[]>>` where `MiembroAsistioCategoria` is the closed literal union `'hermanos'|'hermanas'|'ninos'|'adolescentes'|'heRestauracion'`. Confirmed safe against every real caller (`historial/page.tsx` only ever accesses those exact five keys). Added a `@ts-expect-error`-based compile-time pin test — works because `pnpm type-check` (`tsc --noEmit`) covers `**/*.test.ts` per `tsconfig.json`'s `include`, while `jest`'s SWC transform does not type-check, so the pin only fires at `type-check` time, never breaking `jest`.
2. **Malformed `desde`/`hasta` bound** — `filterRecordsByDateRange` now treats a bound as "active" only if it parses via `toEpochDay` (real calendar date). An omitted, empty, or malformed bound (e.g. `'2026-13-01'`) is inert: it never narrows the range and never flips an otherwise-inactive range to active (which would otherwise start excluding rows with unparseable `fecha`). Added 2 tests: a lone malformed bound (all rows unchanged) and a malformed bound alongside one valid bound (valid bound still applies, malformed side ignored).
3. **`fetchHistorial()` unbounded read** — left untouched; no data-layer redesign was introduced by this slice.
4. **`console.error` on the catch path** — added to `HistorialEstadisticasPage.tsx`'s `catch` block, alongside the existing user-facing error message, at no cost to behavior.

## Work Unit Evidence

| Evidence | Value |
|---|---|
| Focused test command and exact result | `pnpm test -- src/__tests__/lib/historial-stats.test.ts` → all cases in that file pass, including the 4 new tests (2 malformed-bound, 2 `AttendeeBuckets` pins); full-suite confirmation below (`pnpm test`: 299/299 passing, 23 suites) |
| Runtime harness command/scenario and exact result | `pnpm build` — Next.js production build compiles, type-checks, and statically prerenders all 19 routes including `/historial/estadisticas`, `/historial`, `/historial/[id]`; zero build errors. No jsdom/RTL runtime harness was used for the chart/cards per design D8 (unit-test-only verification policy) |
| Rollback boundary | This entire slice reverts cleanly by: restoring the 3 deleted orphan files (`git checkout` on the delete), removing the 5 new files under `estadisticas/`/`shared/ui/`, and reverting the 5 modified files (`historial-stats.ts`, its test file, `HistorialEstadisticasPage.tsx`, `historial/[id]/page.tsx`, `package.json`/`pnpm-lock.yaml`). No Slice A file is touched by any of these changes, so Slice A (PR #19, already merged) is unaffected by a full revert of this slice |

## Verification (actual command output)

### `pnpm type-check`
```
> ser-ujier@0.1.0 type-check /home/ngomez/Nico/SerUjier
> tsc --noEmit
```
Exit 0, zero errors.

### `pnpm lint`
```
> ser-ujier@0.1.0 lint /home/ngomez/Nico/SerUjier
> next lint

 ⚠ Warning: Found multiple lockfiles. Selecting /home/ngomez/package-lock.json.
   Consider removing the lockfiles at:
   * /home/ngomez/Nico/SerUjier/pnpm-lock.yaml

✔ No ESLint warnings or errors
```
(The multiple-lockfiles warning is a pre-existing environment condition, unrelated
to this slice, and was not touched.) Getting to a clean run required two mechanical
fixes to the newly-vendored `chart.tsx`/`skeleton.tsx` (not pre-existing files):
`pnpm prettier --write` on those two files (quote/semicolon style) and one
`!= null` → `!== null && ... !== undefined` fix in `chart.tsx` (`eqeqeq` rule),
with no behavior change. The 15 pre-existing prettier-failing files elsewhere in
the repo were left untouched, per constraint.

### `pnpm test`
Full suite: **299 tests / 23 suites, all passing**, including the 4 tests added
this slice. Pre-existing `act()` / `aria-describedby` console warnings from an
unrelated `AmigosFormDialog` dialog test are unchanged noise, not failures.

### `pnpm build`
```
 ✓ Compiled successfully in 8.0s
   Linting and checking validity of types ...
   Collecting page data ...
 ✓ Generating static pages (19/19)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                                 Size  First Load JS
┌ ○ /                                      150 B         101 kB
├ ○ /_not-found                            997 B         101 kB
├ ○ /amigos                               3.8 kB         266 kB
├ ƒ /amigos/[id]                         7.42 kB         253 kB
├ ƒ /api/auth                              150 B         101 kB
├ ƒ /api/auth/check-session                150 B         101 kB
├ ƒ /api/auth/login                        150 B         101 kB
├ ƒ /api/auth/session                      150 B         101 kB
├ ƒ /api/auth/usuarios-login               150 B         101 kB
├ ƒ /api/health                            150 B         101 kB
├ ƒ /api/users                             150 B         101 kB
├ ○ /conteo                              23.6 kB         311 kB
├ ○ /he-restauracion                     3.85 kB         266 kB
├ ○ /historial                           9.86 kB         775 kB
├ ƒ /historial/[id]                      5.62 kB         771 kB
├ ○ /historial/estadisticas              7.51 kB         244 kB
├ ○ /login                               5.66 kB         238 kB
├ ○ /miembros                            6.26 kB         288 kB
├ ƒ /miembros/[id]                       7.25 kB         282 kB
├ ○ /ujieres                             10.1 kB         289 kB
└ ƒ /ujieres/[id]                        4.28 kB         271 kB
+ First Load JS shared by all             100 kB
  ├ chunks/09cc5eb1-51ecdf8a40c2db00.js  54.1 kB
  ├ chunks/1560-587c61497233e4a8.js      44.2 kB
  └ other shared chunks (total)          2.06 kB

ƒ Middleware                             31.5 kB
```
(`/historial` and `/historial/[id]` are already large pre-existing chunks —
unrelated xlsx/PDF export libraries, not touched or grown by this slice.
`/historial/estadisticas`, which does load `recharts` on demand, is far
smaller at 244 kB First Load JS — itself indirect evidence that `recharts`
never became a directly-bundled dependency of any of these routes.)

## Requirement 1 proof: bundle isolation (recharts NOT in the historial list chunk)

Direct `grep` for `recharts` across every chunk that any of `/historial`,
`/historial/[id]`, or `/historial/estadisticas` eagerly loads (per
`.next/app-build-manifest.json`), plus the shared framework chunks:

```
$ grep -l "recharts" \
    .next/static/chunks/app/\(dashboard\)/historial/page-e3af0b6d70396fa9.js \
    .next/static/chunks/app/\(dashboard\)/historial/\[id\]/page-ab435aa610d5b608.js \
    .next/static/chunks/app/\(dashboard\)/historial/estadisticas/page-b930d93eedff3cb2.js \
    .next/static/chunks/1560-587c61497233e4a8.js \
    .next/static/chunks/09cc5eb1-51ecdf8a40c2db00.js
# (no output, exit code 1 -- not found in any of them)
```

`recharts` was found in exactly two files, both on-demand webpack chunks that
are **not** listed in any route's eager-load list in `app-build-manifest.json`:

```
$ find .next/static/chunks -iname "*.js" | xargs grep -l "recharts"
.next/static/chunks/4864.e7736dd148814d96.js
.next/static/chunks/9382.fce162d8f7f7eb7c.js
```

`.next/react-loadable-manifest.json` confirms these two chunks belong
specifically to the dynamic import in `ServicioAveragesCard.tsx`:

```
"features/historial/components/estadisticas/ServicioAveragesCard.tsx -> ./ServicioAveragesChart": {
  "id": 49382,
  "files": [
    "static/chunks/4864.e7736dd148814d96.js",
    "static/chunks/9382.fce162d8f7f7eb7c.js"
  ]
}
```

Conclusion: `recharts` is not present in the historial list chunk, the
`[id]` detail chunk, the estadisticas page's own eager chunk, or any shared
framework chunk. It lives only in an on-demand chunk fetched by the browser
the moment `ServicioAveragesCard`'s `next/dynamic(..., { ssr: false })` import
actually resolves — i.e. only when a user is on `/historial/estadisticas`.
Spec Requirement 1 (bundle isolation) is satisfied.

## Not done / deviations (honesty disclosure)

- Tasks 5.4 and 7.4 (interactive `npm run dev` / manual browser click-through)
  were **not executed** — this sandboxed environment has no browser or
  dev-server tooling available to me. Substituted equivalent evidence: a
  successful production build that statically prerenders `/historial/estadisticas`,
  a green full test suite, and direct code review confirming the averages memo
  (`[records, desde, hasta]`) and the faltantes memo (`[data]`, no `desde`/`hasta`)
  are structurally independent, and that `RoleGuard requiredPermission="historial.view"`
  still wraps the page. This mirrors the precedent set by Slice A's task 3.4
  disclosure.
- `ServicioAveragesCard.tsx`'s "button to filter" was implemented as a
  "Limpiar" (clear) button rather than an apply/submit trigger, since
  `desde`/`hasta` are live-controlled page-level state and every keystroke
  already re-triggers the memo. Disclosed inline in `tasks.md` 5.1.
- Interpreted design.md D5 (not tasks.md's more ambiguous 5.1/5.2 phrasing) as
  authoritative for which file is "the only module that imports recharts":
  `ServicioAveragesChart.tsx`, not `ServicioAveragesCard.tsx`.

## Not touched (explicit constraints honored)

- `openspec/changes/historial-stats/verify-report.md` — not edited (verify
  phase's artifact).
- The `phases:` block of `openspec/changes/historial-stats/state.yaml` — not
  edited (orchestrator-owned). Its pre-existing uncommitted
  `size_exception_slice_b` diff, present before this session started, was
  left exactly as found.
- `src/__tests__/lib/sort-utils.test.ts` — untracked orphan from an unrelated
  earlier session; not staged, not modified, not referenced by any change in
  this slice.
- `src/shared/lib/utils.ts` (legacy historial CRUD) — not touched.
- No commit, push, or PR was created; delivery is the orchestrator's
  responsibility after a bounded review.

---

## Post-apply amendment (2026-08-25, orchestrator + owner)

Task 3.3b originally repointed the `historial/[id]` "Total Asistentes" card from
`allMembers.length` to `asistentes.length`, exactly as spec requirement 8 was
written. Orchestrator verification of the applied result found that the card then
rendered a value identical to the adjacent "Asistentes" card — two cards, the
same number, near-identical labels.

The reading behind the original requirement now looks inverted: `Asistentes +
Faltantes` equals the total registered miembros, so `allMembers.length` was
plausibly the intended denominator and the **label** was the defect, not the
value.

Owner decision: **remove the card.** The quick-stat row is now two cards,
"Asistentes" and "Faltantes", and the grid dropped from `sm:grid-cols-3` to
`sm:grid-cols-2`.

Artifacts amended to keep the change coherent:

- `specs/historial-stats/spec.md` — requirement 8 retitled "Historial Detail
  Redundant Quick-Stat Removed", two scenarios, decision history recorded inline.
- `design.md` — File Changes row for `historial/[id]/page.tsx` updated.
- `tasks.md` — task 3.3b note rewritten to describe the supersession.

Re-verified after the amendment:

```
pnpm lint         No ESLint warnings or errors
pnpm type-check   exit 0
pnpm test         299 passed, 23 suites
pnpm build        compiled successfully
```

`Users` (6 uses) and `allMembers` (2 uses) remain referenced elsewhere in the
file, so removing the card left no unused import or variable.
